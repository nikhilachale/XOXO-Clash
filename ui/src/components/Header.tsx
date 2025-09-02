import React from 'react';
import { Gamepad2, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/75">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-white">XOXO Clash</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105">
              Play Now
            </button>
          </nav>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-black/50 backdrop-blur-md border-t border-white/20">
          <div className="px-4 py-4 space-y-4">

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200">
              Play Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;