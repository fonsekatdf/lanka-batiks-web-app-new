import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import authService from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);

    try {
      const result = await authService.login({ email, password });

      if (!result?.data?.token || !result?.data?.user) {
        throw new Error("The server returned an unexpected login response.");
      }

      setToken(result.data.token);
      setUser(result.data.user);

      return result.data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true);

    try {
      return await authService.register({ name, email, password });
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return null;
    }

    const result = await authService.getCurrentUser(token);

    if (!result?.data?.user) {
      throw new Error("The server returned an unexpected profile response.");
    }

    setUser(result.data.user);
    return result.data.user;
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshCurrentUser,
    }),
    [
      token,
      user,
      loading,
      login,
      register,
      logout,
      refreshCurrentUser,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
