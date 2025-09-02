import React, { useState } from 'react';

interface Props {
  onClose: () => void;
}

const JoinRoomModal: React.FC<Props> = ({ onClose }) => {
  const [code, setCode] = useState("");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80 max-w-full">
        <h2 className="text-xl font-semibold text-center mb-4">Join Room</h2>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Enter Room Code"
          className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 w-full mb-4 text-center"
        />
        <button
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
          onClick={() => window.location.href = `/game?room=${code}`}
        >
          Play
        </button>
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

export default JoinRoomModal;