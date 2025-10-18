import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const AdminPanel: React.FC = () => {
  const { user, approveUser } = useAuth();

  // In a real app, this would be protected and on a separate page.
  // It is always visible here for demonstration and testing purposes.
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-amber-400 rounded-lg p-4 shadow-lg z-50 w-64">
      <h4 className="text-lg font-bold text-amber-300 mb-2 border-b border-gray-600 pb-2">Admin Simulation</h4>
      {user.status === 'pending' ? (
        <div>
          <p className="text-gray-300 text-sm">Pending approval for:</p>
          <p className="font-semibold text-white mb-2">{user.username}</p>
          <button
            onClick={approveUser}
            className="w-full mt-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
          >
            Approve User
          </button>
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No pending approvals.</p>
      )}
    </div>
  );
};