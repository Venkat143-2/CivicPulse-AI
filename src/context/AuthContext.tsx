import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCitizen: boolean;
  loginCitizen: (email: string, fullName?: string, phone?: string) => void;
  loginAdmin: (email: string, officerName?: string) => void;
  logout: () => void;
  updateUserPhone: (phone: string, verified: boolean) => void;
  switchRole: (role: UserRole) => void;
}

const DEFAULT_CITIZEN: UserProfile = {
  id: 'citizen-demo-1',
  email: 'aarav.sharma@gmail.com',
  fullName: 'Aarav Sharma',
  phone: '+91 9876543210',
  phoneVerified: true,
  role: 'citizen',
  createdAt: '2026-01-15T10:00:00Z',
};

const DEFAULT_ADMIN: UserProfile = {
  id: 'admin-demo-1',
  email: 'priya.raman@bbmp.gov.in',
  fullName: 'Priya Raman',
  phone: '+91 9123456780',
  phoneVerified: true,
  role: 'admin',
  createdAt: '2025-11-01T08:30:00Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('civicpulse_user');
      return stored ? JSON.parse(stored) : DEFAULT_CITIZEN;
    } catch {
      return DEFAULT_CITIZEN;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('civicpulse_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('civicpulse_user');
    }
  }, [user]);

  const loginCitizen = (email: string, fullName = 'Citizen User', phone?: string) => {
    const newUser: UserProfile = {
      id: `citizen-${Date.now()}`,
      email,
      fullName,
      phone,
      phoneVerified: false,
      role: 'citizen',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
  };

  const loginAdmin = (email: string, officerName = 'Municipal Officer') => {
    const newUser: UserProfile = {
      id: `admin-${Date.now()}`,
      email,
      fullName: officerName,
      phone: '+91 9900011223',
      phoneVerified: true,
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUserPhone = (phone: string, verified: boolean) => {
    if (!user) return;
    setUser({
      ...user,
      phone,
      phoneVerified: verified,
    });
  };

  const switchRole = (role: UserRole) => {
    if (role === 'admin') {
      setUser(DEFAULT_ADMIN);
    } else {
      setUser(DEFAULT_CITIZEN);
    }
  };

  const role = user?.role || null;
  const isAuthenticated = Boolean(user);
  const isAdmin = role === 'admin';
  const isCitizen = role === 'citizen';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdmin,
        isCitizen,
        loginCitizen,
        loginAdmin,
        logout,
        updateUserPhone,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
