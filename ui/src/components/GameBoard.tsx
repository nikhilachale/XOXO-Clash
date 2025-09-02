import { useEffect, useState } from 'react'


function GameBoard() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [winner, setWinner] = useState<string | null>(null)
  const [symbol, setSymbol] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [username, setUsername] = useState<string>("Player");
  const [players, setPlayers] = useState<{ X: { id: string, username: string } | null; O: { id: string, username: string } | null }>({
    X: null,
    O: null,
  });
  const [currentTurn, setCurrentTurn] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
   const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connection established");
      console.log("playerid on open ", playerId);
    };

    ws.onmessage = (event) => {
      try {
        console.log("playerid on message", playerId);
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data);

        if (data.type === "room_created") {
          setRoomCode(data.room.code);
          setPlayerId(data.player.id);
          setSymbol(data.player.symbol);
          setUsername(data.player.username);

          setPlayers({ X: { id: data.player.id, username: data.player.username }, O: null }); // Only X is set
          setCurrentTurn(data.player.id); // X always starts
        }

        if (data.type === "room_joined") {
          setRoomCode(data.room.code);
          setPlayerId(data.player.id);
          setSymbol(data.player.symbol);
          setUsername(data.player.username);

          setPlayers(prev => ({ ...prev, O: { id: data.player.id, username: data.player.username } }));

        }
        if (data.type === "player_joined") {
          setPlayers({
            X: data.room.players.find((p: any) => p.symbol === "X") || null,
            O: data.room.players.find((p: any) => p.symbol === "O") || null,
          });
          
          console.log("Players updated:", players);
        }

        if (data.type === "move_made") {
          setBoard(prevBoard => {
            if (prevBoard[data.position]) return prevBoard;
            const newBoard = [...prevBoard];
            newBoard[data.position] = data.symbol;
            return newBoard;
          });

          // 🔑 Trust server's turn instead of calculating
          setCurrentTurn(data.currentTurn);
        }
        if (data.type === "game_won") {
          // 1️⃣ Update board with winning positions
          setBoard(prevBoard => {
            const newBoard = [...prevBoard];
            if (data.winningPositions) {
              data.winningPositions.forEach((pos: number) => {
                newBoard[pos] = data.symbol || (data.winnerId === players.X ? "X" : "O");
              });
            }
            return newBoard;
          });

          // 2️⃣ Update winning line for highlighting
          setWinningLine(data.winningPositions || []);

          // 3️⃣ Trigger popup
          console.log("Game won by:", data.playerId);
          setWinner(data.playerId);
        }

        if (data.type === "game_draw") {
          setWinner("Draw");
          alert("Game Draw!");
        }

        if (data.type === "game_restarted") {
          setBoard(Array(9).fill(null));
          setWinner(null);
          setWinningLine([]);
          setCurrentTurn(data.currentTurn ?? players.X);
        }
      } catch (e) {
        console.warn("Received non-JSON message:", event.data);
      }
    };

    return () => {
      ws.close(); // cleanup
    };
    // Only run once on mount
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    console.log("symbol state updated:", symbol);
  }, [symbol]);

  useEffect(() => {
    console.log("username state updated:", username);
  }, [username]);

  useEffect(() => {
    console.log("player state updated:", players);
  }, [players]);
  useEffect(() => {
    console.log("Board state updated:", board);
  }, [board]);
  const handleCellClick = (idx: number) => {
    if (!symbol || !roomCode || !socket || winner) return;

    if (playerId !== currentTurn) {
      alert("Not your turn!");
      return;
    }

    if (board[idx]) return;

    // 1. Update board locally
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      newBoard[idx] = symbol;
      return newBoard;
    });

    // 2. Flip turn locally for instant feedback
    if (playerId === players.X?.id) {
      setCurrentTurn(players.O?.id || null);
    } else if (playerId === players.O?.id) {
      setCurrentTurn(players.X?.id || null);
    }

    // 3. Send move to server
    socket.send(JSON.stringify({
      type: "move",
      roomCode,
      playerId,
      position: idx
    }));
  };

  if (players.O === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <h2 className="text-3xl font-extrabold mb-6 text-indigo-600 dark:text-indigo-400 text-center">Waiting for another player to join...</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">Share the room code with a friend to start playing!</p>
        <p className="mb-6 font-mono text-lg text-indigo-700 dark:text-indigo-300 text-center">{roomCode || "---"}</p>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <button
              onClick={() => { if (socket) socket.send(JSON.stringify({ type: "create_room", username: "Player X" })); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md w-full sm:w-auto"
            >
              Create Room
            </button>
            <div className="flex flex-col gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md w-full sm:w-auto"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
        {showJoinModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowJoinModal(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80 max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4 text-indigo-700 dark:text-indigo-400 text-center">Join Room</h2>
              <input
                type="text"
                value={roomCode || ""}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter Room Code"
                className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 w-full mb-4 text-center bg-gray-50 dark:bg-gray-700"
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="py-2 px-4 rounded bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (socket && roomCode) {
                      socket.send(JSON.stringify({ type: "join_room", roomCode }));
                      setShowJoinModal(false);
                    }
                  }}
                  className="py-2 px-4 rounded bg-green-500 hover:bg-green-600 text-white transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 pt-20 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col items-center">


      {/* Room Info */}
      <div className="mb-6 p-4 pt-5 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md flex justify-between items-center text-center">
        <p className="font-semibold text-gray-700 dark:text-gray-300">
          Room: <span className="text-indigo-600 dark:text-indigo-400">{roomCode || "---"}</span>
        </p>
        <p className="font-semibold text-gray-700 dark:text-gray-300">
          Symbol: <span className="text-green-600 dark:text-green-400">{symbol || "---"}</span>
        </p>
        <p className="font-semibold text-gray-700 dark:text-gray-300">
          Player: <span className="text-purple-600 dark:text-purple-400">{username}</span>
        </p>
      </div>

      {/* Current Turn */}
      <div className="mb-6 text-center">
        <p className={`font-semibold text-lg ${currentTurn === players.X?.id ? 'text-indigo-600 dark:text-indigo-400' : currentTurn === players.O?.id ? 'text-rose-600 dark:text-rose-400' : ''}`}>
          Current Turn: {currentTurn === players.X?.id ? 'Player X' : currentTurn === players.O?.id ? 'Player O' : 'N/A'}
        </p>
      </div>

      {/* Game Board */}
      <div className="relative mb-6 w-full max-w-md sm:max-w-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
        <div className="relative bg-white/10 dark:bg-gray-800 backdrop-blur-md rounded-3xl p-6 border border-white/20 flex items-center justify-center">
          {/* Grid */}
          <div className="grid grid-cols-3 grid-rows-3 gap-4 w-full h-full">
            {board.map((cell, idx) => {
              const isWinningCell = winningLine.includes(idx);
              const isDisabled = !currentTurn || (playerId !== currentTurn);
              return (
                <div
                  key={idx}
                  onClick={() => { if (!isDisabled) handleCellClick(idx) }}
                  className={`aspect-square bg-white/5 hover:bg-white/20 rounded-xl border border-white/20 flex items-center justify-center transition-all duration-300
              ${isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
              ${isWinningCell ? 'shadow-[0_0_20px_5px_rgba(16,185,129,0.75)] dark:shadow-[0_0_20px_5px_rgba(20,184,166,0.9)]' : ''}
              ${cell === 'X' ? 'text-blue-600 text-7xl font-extrabold' : cell === 'O' ? 'text-indigo-500 text-7xl font-extrabold' : 'text-gray-400 dark:text-gray-500 text-5xl'}
            `}
                >
                  {cell}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-6 justify-center mb-8">
        <button
          onClick={() => { if (socket) socket.send(JSON.stringify({ type: "create_room", username: "Player X" })); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-40 text-center"
        >
          Create Room
        </button>
        <button
          onClick={() => setShowJoinModal(true)}
          className="border-2 border-green-600 hover:border-green-700 text-green-600 hover:text-green-700 font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 w-40 text-center bg-transparent"
        >
          Join Room
        </button>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50" onClick={() => setShowJoinModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80 max-w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4 text-indigo-700 dark:text-indigo-400 text-center">Join Room</h2>
            <input
              type="text"
              value={roomCode || ""}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter Room Code"
              className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 w-full mb-4 text-center bg-gray-50 dark:bg-gray-700"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowJoinModal(false)}
                className="py-2 px-4 rounded bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (socket && roomCode) {
                    socket.send(JSON.stringify({ type: "join_room", roomCode }));
                    setShowJoinModal(false);
                  }
                }}
                className="py-2 px-4 rounded bg-green-500 hover:bg-green-600 text-white transition-colors"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winner Popup */}
      {winner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg text-center max-w-xs w-full">
            <h2 className="text-3xl font-extrabold mb-6 text-indigo-700 dark:text-indigo-400">
              {winner === "Draw"
                ? "Draw!"
                : `${winner === players.X?.id ? players.X?.username : players.O?.username} Won!`}
            </h2>
            <button
              onClick={() => {
                if (socket && roomCode && playerId) {
                  setWinner(null);
                  socket.send(JSON.stringify({ type: "restart", roomCode, playerId }));
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Restart Game
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameBoard;
