import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo
} from "react";
import * as authService from "../api/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("somatic_token"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("somatic_user") || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    authService.getMe()
      .then(({ user: currentUser }) => {
        setUser(currentUser);
        localStorage.setItem("somatic_user", JSON.stringify(currentUser));
      })
      .catch(() => {
        localStorage.removeItem("somatic_token");
        localStorage.removeItem("somatic_user");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const signIn = async (payload) => {
    const result = await authService.login(payload);
    localStorage.setItem("somatic_token", result.token);
    localStorage.setItem("somatic_user", JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    return result;
  };

  const signUp = async (payload) => {
    const result = await authService.register(payload);
    localStorage.setItem("somatic_token", result.token);
    localStorage.setItem("somatic_user", JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    return result;
  };

  const signOut = async () => {
    try { await authService.logout(); } catch {}
    localStorage.removeItem("somatic_token");
    localStorage.removeItem("somatic_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, loading, signIn, signUp, signOut }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);