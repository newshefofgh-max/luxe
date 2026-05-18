'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IUser } from '@/types';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface AuthContextType {
  currentUser: IUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
  updateProfile: (data: Partial<IUser>) => Promise<boolean>;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore user from localStorage token
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('accessory_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.data.user);
        } else {
          localStorage.removeItem('accessory_token');
        }
      } catch {
        localStorage.removeItem('accessory_token');
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('accessory_token', data.data.token);
        setCurrentUser(data.data.user);
        toast.success('Welcome back! مرحباً بعودتك');
        return true;
      } else {
        toast.error(data.error || data.message || 'Login failed. Please check your credentials.');
        return false;
      }
    } catch {
      toast.error('Connection error. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessory_token');
    setCurrentUser(null);
    toast.success('Logged out successfully.');
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok) {
        localStorage.setItem('accessory_token', result.data.token);
        setCurrentUser(result.data.user);
        toast.success('Account created! حساب تم إنشاؤه');
        return true;
      } else {
        toast.error(result.error || result.message || 'Registration failed.');
        return false;
      }
    } catch {
      toast.error('Connection error. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<IUser>): Promise<boolean> => {
    const token = localStorage.getItem('accessory_token');
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        setCurrentUser(result.data.user);
        toast.success('Profile updated!');
        return true;
      }
      toast.error(result.error || result.message || 'Update failed.');
      return false;
    } catch {
      toast.error('Connection error.');
      return false;
    }
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ currentUser, isLoading, isAdmin, login, logout, register, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessory_token');
}
