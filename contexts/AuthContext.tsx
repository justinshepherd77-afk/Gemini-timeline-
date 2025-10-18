import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    status: 'guest',
    username: null,
    credits: 0,
  });

  const login = () => {
    // Set user to pending, awaiting admin approval
    setUser({
      status: 'pending',
      username: 'Tester_Account',
      credits: 0, 
    });
  };

  const logout = () => {
    setUser({
      status: 'guest',
      username: null,
      credits: 0,
    });
  };

  const approveUser = () => {
    if (user.status === 'pending') {
      setUser(prevUser => ({
        ...prevUser,
        status: 'approved',
        credits: 1000, // Grant generous credits on approval
      }));
    }
  };

  const useCredit = (cost: number): boolean => {
    if (user.credits >= cost) {
      setUser(prevUser => ({ ...prevUser, credits: prevUser.credits - cost }));
      return true;
    }
    return false;
  };

  const addCredits = () => {
    // Provide a generous "refill" for testers
    if (user.status === 'approved') {
      setUser(prevUser => ({ ...prevUser, credits: prevUser.credits + 100 }));
    }
  };

  const value = { user, login, logout, useCredit, addCredits, approveUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};