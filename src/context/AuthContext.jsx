// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getAuthToken, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user from token on startup
  const fetchCurrentUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();

      if (res && res.success && res.data) {
        setUser(res.data);
        return;
      }

      // Only clear the saved token for explicit auth failures.
      // A temporary backend error (for example 500 while DB is down)
      // should not force a hard logout on refresh.
      if (res?.status === 401 || res?.status === 403) {
        setAuthToken(null);
        setUser(null);
      } else {
        console.warn('Session refresh failed without invalidating the token:', res?.message || 'Unknown error');
        setUser(null);
      }
    } catch (err) {
      console.warn('Failed to load user session:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res && res.success && res.data?.token) {
      setAuthToken(res.data.token);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    }
    return {
      success: false,
      message: res?.message || 'Login gagal. Periksa kembali email dan password.',
      errors: res?.errors || null,
    };
  };

  const register = async (name, email, password, password_confirmation) => {
    const res = await api.register({
      name,
      email,
      password,
      password_confirmation,
      role: 'student',
    });

    if (res && res.success && res.data?.token) {
      setAuthToken(res.data.token);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    }
    return {
      success: false,
      message: res?.message || 'Registrasi gagal. Silakan coba lagi.',
      errors: res?.errors || null,
    };
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: getAuthToken(),
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
