import React, { useEffect, useState } from 'react';

interface Props {
  onClose: () => void;
}

const CreateRoomModal: React.FC<Props> = ({ onClose }) => {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => ws.send(JSON.stringify({ type: "create_room", username: "Player X" }));
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "room_created") {
        setRoomCode(data.room.code);
        setPlayerId(data.player.id);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80 max-w-full">
        <h2 className="text-xl font-semibold text-center mb-4">Room Created</h2>
        <p className="text-center text-lg mb-4 font-mono">{roomCode || "Fetching..."}</p>
        {roomCode && playerId && (
          <button
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            onClick={() => window.location.href = `/game?room=${roomCode}&player=${playerId}`}
          >
            Play
          </button>
        )}
        <button
          className="w-full py-2 mt-2 text-gray-700 dark:text-gray-200 hover:underline"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateRoomModal;