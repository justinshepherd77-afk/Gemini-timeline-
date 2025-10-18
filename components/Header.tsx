import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, login, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-20 shadow-lg shadow-cyan-500/10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-center flex-grow">
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-300 tracking-wider">
            Chronolink
          </h1>
          <p className="text-sm md:text-base text-gray-400 mt-1">
            Linking Echoes of History Across the Globe
          </p>
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {user.status === 'approved' ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-700 p-2 rounded-lg transition-colors">
                <span className="text-white font-semibold">{user.username}</span>
                <div className="flex items-center text-amber-300" title="Credits">
                  <span>{user.credits}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                     <path d="M8.433 7.418c.158-.103.346-.195.552-.257C10.636 6.758 11.837 7 13 7c2.209 0 4 1.791 4 4s-1.791 4-4 4c-1.163 0-2.364-.242-3.015-.629a1.71 1.71 0 01-.552-.257c-.158.103-.346.195-.552.257C7.364 15.242 6.163 15.5 5 15.5c-2.209 0-4-1.791-4-4s1.791-4 4-4c1.163 0 2.364.242 3.015.629.206.062.394.154.552.257z" />
                  </svg>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 border border-gray-700">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Account</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Settings</a>
                  <div className="border-t border-gray-700 my-1"></div>
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-gray-700">Logout</button>
                </div>
              )}
            </div>
          ) : user.status === 'pending' ? (
            <div className="text-amber-300 bg-gray-700/50 p-2 rounded-lg text-sm font-semibold">
              Pending Approval...
            </div>
          ) : (
            <button onClick={login} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};