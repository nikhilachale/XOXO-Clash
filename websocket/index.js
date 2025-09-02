"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const db_1 = require("@repo/db");
const crypto_1 = __importDefault(require("crypto"));
const prisma = db_1.prismaClient;
const wss = new ws_1.WebSocketServer({ port: 8080 });
function generateRoomCode() {
    return crypto_1.default.randomBytes(6).toString("base64url").slice(0, 8).toUpperCase();
}
// Memory store
const rooms = {};
// Broadcast helper
function broadcast(roomCode, message) {
    const msg = JSON.stringify(message);
    wss.clients.forEach(client => {
        if (client.roomCode === roomCode && client.readyState === 1) {
            client.send(msg);
        }
    });
}
wss.on('connection', ws => {
    console.log('Client connected');
    ws.on('message', (msg) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        let parsed;
        try {
            parsed = JSON.parse(msg.toString());
        }
        catch (_d) {
            return;
        }
        // ================== CREATE ROOM ==================
        if (parsed.type === 'create_room') {
            const roomCode = generateRoomCode();
            const playerId = crypto_1.default.randomUUID();
            const player = { id: playerId, username: parsed.username || 'Player X', symbol: 'X' };
            // Memory store
            rooms[roomCode] = {
                id: crypto_1.default.randomUUID(),
                code: roomCode,
                players: [player],
                moves: Array(9).fill(null),
                currentTurn: playerId,
                status: 'waiting'
            };
            // Attach to websocket
            ws.roomCode = roomCode;
            ws.playerId = playerId;
            // Broadcast to creator
            ws.send(JSON.stringify({ type: 'room_created', room: rooms[roomCode], player }));
            // Async DB save
            (() => __awaiter(void 0, void 0, void 0, function* () {
                const dbRoom = yield prisma.room.create({
                    data: {
                        code: roomCode,
                        ownerId: playerId,
                        currentTurn: playerId,
                        players: { create: { id: playerId, username: player.username, symbol: 'X' } }
                    }
                });
                rooms[roomCode].id = dbRoom.id; // update memory id
            }))();
        }
        // ================== JOIN ROOM ==================
        if (parsed.type === 'join_room') {
            const room = rooms[parsed.roomCode];
            if (!room) {
                ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
                return;
            }
            if (room.players.length >= 2) {
                ws.send(JSON.stringify({ type: 'error', message: 'Room full' }));
                return;
            }
            const playerId = crypto_1.default.randomUUID();
            const player = { id: playerId, username: parsed.username || 'Player O', symbol: 'O' };
            room.players.push(player);
            room.status = 'playing';
            ws.roomCode = parsed.roomCode;
            ws.playerId = playerId;
            // Broadcast join
            broadcast(parsed.roomCode, { type: 'player_joined', room, player });
            ws.send(JSON.stringify({ type: 'room_joined', room, player }));
            // Async DB save
            (() => __awaiter(void 0, void 0, void 0, function* () {
                yield prisma.player.create({ data: { id: playerId, username: player.username, symbol: 'O', roomId: room.id } });
            }))();
        }
        // ================== MOVE ==================
        if (parsed.type === 'move') {
            const room = rooms[parsed.roomCode];
            if (!room)
                return ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
            const playerId = parsed.playerId;
            if (room.currentTurn !== playerId)
                return ws.send(JSON.stringify({ type: 'error', message: 'Not your turn' }));
            if (room.moves[parsed.position])
                return ws.send(JSON.stringify({ type: 'error', message: 'Cell taken' }));
            // Update memory
            room.moves[parsed.position] = (_a = room.players.find((p) => p.id === playerId)) === null || _a === void 0 ? void 0 : _a.symbol;
            room.currentTurn = (_b = room.players.find((p) => p.id !== playerId)) === null || _b === void 0 ? void 0 : _b.id;
            // Check winner in memory
            const winningCombos = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],
                [0, 3, 6], [1, 4, 7], [2, 5, 8],
                [0, 4, 8], [2, 4, 6]
            ];
            let winnerSymbol, winningPositions;
            for (const combo of winningCombos) {
                const symbols = combo.map(i => room.moves[i]);
                if (symbols[0] && symbols.every(s => s === symbols[0])) {
                    winnerSymbol = symbols[0];
                    winningPositions = combo;
                    room.status = 'finished';
                    room.winnerId = (_c = room.players.find((p) => p.symbol === winnerSymbol)) === null || _c === void 0 ? void 0 : _c.id;
                    break;
                }
            }
            // Broadcast move
            broadcast(parsed.roomCode, {
                type: winnerSymbol ? 'game_won' : room.moves.every((m) => m) ? 'game_draw' : 'move_made',
                roomCode: parsed.roomCode,
                playerId,
                position: parsed.position,
                symbol: room.moves[parsed.position],
                currentTurn: room.currentTurn,
                winningPositions
            });
            // Async DB save
            (() => __awaiter(void 0, void 0, void 0, function* () {
                yield prisma.move.create({
                    data: { playerId, roomId: room.id, index: parsed.position, symbol: room.moves[parsed.position] }
                });
                if (winnerSymbol)
                    yield prisma.room.update({ where: { id: room.id }, data: { status: 'finished', winnerId: room.winnerId } });
            }))();
        }
        // ================== RESTART ==================
        if (parsed.type === 'restart') {
            const room = rooms[parsed.roomCode];
            if (!room)
                return;
            room.moves = Array(9).fill(null);
            room.currentTurn = room.players[0].id;
            room.status = 'playing';
            room.winnerId = undefined;
            broadcast(parsed.roomCode, { type: 'game_restarted', currentTurn: room.currentTurn });
            // Async DB cleanup
            (() => __awaiter(void 0, void 0, void 0, function* () {
                yield prisma.move.deleteMany({ where: { roomId: room.id } });
                yield prisma.room.update({ where: { id: room.id }, data: { currentTurn: room.currentTurn, status: 'playing', winnerId: null } });
            }))();
        }
    }));
});
console.log('WebSocket server running on ws://localhost:8080');
