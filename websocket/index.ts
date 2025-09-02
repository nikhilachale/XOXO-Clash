import dotenv from "dotenv";
dotenv.config();
import { WebSocketServer } from 'ws';
import { prismaClient } from "./db/src";
import crypto from "crypto";

const prisma = prismaClient;
const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: Number(PORT) });

function generateRoomCode(): string {
  return crypto.randomBytes(6).toString("base64url").slice(0, 8).toUpperCase();
}

// Memory store
const rooms: Record<string, any> = {};

// Broadcast helper
function broadcast(roomCode: string, message: any) {
  const msg = JSON.stringify(message);
  wss.clients.forEach(client => {
    if ((client as any).roomCode === roomCode && client.readyState === 1) {
      client.send(msg);
    }
  });
}

wss.on('connection', ws => {
  console.log('Client connected');

  ws.on('message', async msg => {
    let parsed;
    try { parsed = JSON.parse(msg.toString()); } 
    catch { return; }

    // ================== CREATE ROOM ==================
    if (parsed.type === 'create_room') {
      const roomCode = generateRoomCode();
      const playerId = crypto.randomUUID();
      const player = { id: playerId, username: parsed.username || 'Player X', symbol: 'X' };

      // Memory store
      rooms[roomCode] = {
        id: crypto.randomUUID(),
        code: roomCode,
        players: [player],
        moves: Array(9).fill(null),
        currentTurn: playerId,
        status: 'waiting'
      };

      // Attach to websocket
      (ws as any).roomCode = roomCode;
      (ws as any).playerId = playerId;

      // Broadcast to creator
      ws.send(JSON.stringify({ type: 'room_created', room: rooms[roomCode], player }));

      // Async DB save
      (async () => {
        const dbRoom = await prisma.room.create({
          data: {
            code: roomCode,
            ownerId: playerId,
            currentTurn: playerId,
            players: { create: { id: playerId, username: player.username, symbol: 'X' } }
          }
        });
        rooms[roomCode].id = dbRoom.id; // update memory id
      })();
    }

    // ================== JOIN ROOM ==================
    if (parsed.type === 'join_room') {
      const room = rooms[parsed.roomCode];
      if (!room) { ws.send(JSON.stringify({ type: 'error', message: 'Room not found' })); return; }
      if (room.players.length >= 2) { ws.send(JSON.stringify({ type: 'error', message: 'Room full' })); return; }

      const playerId = crypto.randomUUID();
      const player = { id: playerId, username: parsed.username || 'Player O', symbol: 'O' };
      room.players.push(player);
      room.status = 'playing';

      (ws as any).roomCode = parsed.roomCode;
      (ws as any).playerId = playerId;

      // Broadcast join
      broadcast(parsed.roomCode, { type: 'player_joined', room, player });
      ws.send(JSON.stringify({ type: 'room_joined', room, player }));

      // Async DB save
      (async () => {
        await prisma.player.create({ data: { id: playerId, username: player.username, symbol: 'O', roomId: room.id } });
      })();
    }

    // ================== MOVE ==================
    if (parsed.type === 'move') {
      const room = rooms[parsed.roomCode];
      if (!room) return ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
      const playerId = parsed.playerId;

      if (room.currentTurn !== playerId) return ws.send(JSON.stringify({ type: 'error', message: 'Not your turn' }));
      if (room.moves[parsed.position]) return ws.send(JSON.stringify({ type: 'error', message: 'Cell taken' }));

      // Update memory
  room.moves[parsed.position] = room.players.find((p: { id: string; symbol: string }) => p.id === playerId)?.symbol;
  room.currentTurn = room.players.find((p: { id: string; symbol: string }) => p.id !== playerId)?.id;

      // Check winner in memory
      const winningCombos = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
      ];
  let winnerSymbol: string | undefined, winningPositions: number[] | undefined;
      for (const combo of winningCombos) {
        const symbols = combo.map(i => room.moves[i]);
        if (symbols[0] && symbols.every(s => s === symbols[0])) {
          winnerSymbol = symbols[0];
          winningPositions = combo;
          room.status = 'finished';
          room.winnerId = room.players.find((p: { id: string; symbol: string }) => p.symbol === winnerSymbol)?.id;
          break;
        }
      }

      // Broadcast move
      broadcast(parsed.roomCode, {
  type: winnerSymbol ? 'game_won' : room.moves.every((m: string | null) => m) ? 'game_draw' : 'move_made',
        roomCode: parsed.roomCode,
        playerId,
        position: parsed.position,
        symbol: room.moves[parsed.position],
        currentTurn: room.currentTurn,
        winningPositions
      });

      // Async DB save
      (async () => {
        await prisma.move.create({ 
          data: { playerId, roomId: room.id, index: parsed.position, symbol: room.moves[parsed.position] } 
        });
        if (winnerSymbol) await prisma.room.update({ where: { id: room.id }, data: { status: 'finished', winnerId: room.winnerId } });
      })();
    }

    // ================== RESTART ==================
    if (parsed.type === 'restart') {
      const room = rooms[parsed.roomCode];
      if (!room) return;

      room.moves = Array(9).fill(null);
      room.currentTurn = room.players[0].id;
      room.status = 'playing';
      room.winnerId = undefined;

      broadcast(parsed.roomCode, { type: 'game_restarted', currentTurn: room.currentTurn });

      // Async DB cleanup
      (async () => {
        await prisma.move.deleteMany({ where: { roomId: room.id } });
        await prisma.room.update({ where: { id: room.id }, data: { currentTurn: room.currentTurn, status: 'playing', winnerId: null } });
      })();
    }
  });
});

console.log('WebSocket server running on ws://localhost:' + PORT);