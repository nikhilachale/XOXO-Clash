import React from 'react';
import { Gamepad2, UserPlus, Clock } from 'lucide-react';
import AnimatedBoard from './AnimatedBoard.tsx';

const Hero: React.FC = () => {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Classic
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent"> Tic Tac Toe</span>
              <br />
              <span className="text-3xl lg:text-5xl text-indigo-400">Goes Online</span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl">
              Challenge friends worldwide in real-time multiplayer matches. Experience the timeless game with modern features, 
              lightning-fast gameplay, and seamless cross-platform compatibility.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
               onClick={() => {
                  window.location.href = "/game";
                }}
            
              className="group bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <div className="flex items-center space-x-2">
                  <Gamepad2 className="h-5 w-5 group-hover:animate-pulse" />
                  <span>Create Room</span>
                </div>
              </button>
              <button
                onClick={() => {
                  window.location.href = "/game";
                }}
                className="bg-white/5 hover:bg-white/15 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-indigo-400/30 hover:border-indigo-500/50"
              >
                Join Room
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start space-x-8 text-white/60">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-blue-400" />
                <span>10,000+ Active Players</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-indigo-400" />
                <span>Real-time Matches</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <AnimatedBoard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;