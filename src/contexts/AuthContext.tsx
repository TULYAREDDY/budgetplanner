import React, { createContext, useState, useContext, ReactNode } from 'react';

type UserType = 'Student' | 'Salaried' | 'Freelancer' | 'Family';

interface User {
  id: string;
  name: string;
  email: string;
  income: number;
  userType: UserType;
  isOnboarded: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  register: (name: string, email: string, password: string, income: number, userType: UserType) => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // In a real app, this would make an API call to authenticate
    // For demo purposes, we'll simulate a successful login
    setCurrentUser({
      id: '1',
      name: 'John Doe',
      email,
      income: 50000,
      userType: 'Salaried',
      isOnboarded: true
    });
  };

  const loginAsGuest = () => {
    setCurrentUser({
      id: 'guest',
      name: 'Guest User',
      email: 'guest@example.com',
      income: 40000,
      userType: 'Student',
      isOnboarded: false
    });
  };

  const register = async (name: string, email: string, password: string, income: number, userType: UserType) => {
    // In a real app, this would make an API call to register the user
    // For demo purposes, we'll simulate a successful registration
    setCurrentUser({
      id: Date.now().toString(),
      name,
      email,
      income,
      userType,
      isOnboarded: false
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const completeOnboarding = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        isOnboarded: true
      });
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    loginAsGuest,
    register,
    logout,
    completeOnboarding
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};