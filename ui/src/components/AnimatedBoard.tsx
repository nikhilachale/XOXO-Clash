import React, { useState, useEffect } from 'react';
import { X, Circle } from 'lucide-react';

const AnimatedBoard: React.FC = () => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));

  const demoSequence = [0, 4, 1, 3, 2]; // Winning sequence for demo

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let sequenceIndex = 0;
    let player: 'X' | 'O' = 'X'; // local player variable

    const playDemo = () => {
      if (sequenceIndex < demoSequence.length) {
        const position = demoSequence[sequenceIndex];
        setBoard(prev => {
          const newBoard = [...prev];
          newBoard[position] = player;
          return newBoard;
        });
        player = player === 'X' ? 'O' : 'X'; // flip for next move
        sequenceIndex++;
        timeoutId = setTimeout(playDemo, 1000);
      } else {
        timeoutId = setTimeout(() => {
          setBoard(Array(9).fill(null));
          player = 'X';
          sequenceIndex = 0;
          playDemo();
        }, 2000);
      }
    };

    timeoutId = setTimeout(playDemo, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  const renderIcon = (value: string | null) => {
    if (value === 'X') {
      return <X className="h-12 w-12 text-blue-600" />;
    }
    if (value === 'O') {
      return <Circle className="h-12 w-12 text-indigo-500" />;
    }
    return null;
  };

 

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
      <div className="relative bg-white/10 dark:bg-gray-800 backdrop-blur-md rounded-3xl p-8 border border-white/20">
        <div className="grid grid-cols-3 gap-4 w-72 h-72">
          {board.map((cell, index) => (
            <div
              key={index}
              className="bg-white/5 hover:bg-white/20 rounded-xl border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              {renderIcon(cell)}
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">Live Demo - Auto Playing</p>
          <p className="font-semibold text-blue-400">
            Current Turn: X
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnimatedBoard;