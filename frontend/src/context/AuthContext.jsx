import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { loginUser, registerUser } from '../api/authApi';

const AuthContext = createContext(null);

const getStoredUser = () => {
  const userInfo = localStorage.getItem('userInfo');

  if (!userInfo) {
    return null;
  }

  try {
    return JSON.parse(userInfo);
  } catch (error) {
    localStorage.removeItem('userInfo');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    const data = await loginUser({ email, password });

    localStorage.setItem('userInfo', JSON.stringify(data.user));
    setUser(data.user);

    return data.user;
  };

  const register = async (payload) => {
    const data = await registerUser(payload);

    localStorage.setItem('userInfo', JSON.stringify(data.user));
    setUser(data.user);

    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};