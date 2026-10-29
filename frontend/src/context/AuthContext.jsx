import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState,
} from "react";

import authService from "../services/authService.js";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "lanka-batiks-auth";

function getStoredAuth() {
  const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedAuth) {
    return { token: null, user: null };
  }

  try {
    const parsedAuth = JSON.parse(storedAuth);

    if (typeof parsedAuth.token !== "string" || !parsedAuth.user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return { token: null, user: null };
    }

    return {
      token: parsedAuth.token,
      user: parsedAuth.user,
    };
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [initialAuth] = useState(getStoredAuth);
  const [token, setToken] = useState(initialAuth.token);
  const [user, setUser] = useState(initialAuth.user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ token, user }),
      );
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [token, user]);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);

    try {
      const result = await authService.login({ email, password });

      if (!result?.data?.token || !result?.data?.user) {
        throw new Error("The server returned an unexpected login response.");
      }

      setToken(result.data.token);
      setUser(result.data.user);
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          token: result.data.token,
          user: result.data.user,
        }),
      );

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
