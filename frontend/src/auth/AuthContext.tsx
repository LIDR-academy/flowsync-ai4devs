import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import {
  api,
  ApiError,
  getToken,
  setToken,
  type AuthResult,
  type User,
} from "@/lib/api";

type SignupInput = Parameters<typeof api.signup>[0];

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => getToken() !== null);

  // Hidrata la sesión si ya hay un token guardado.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    api
      .profile()
      .then((profile) => !cancelled && setUser(profile))
      .catch((error) => {
        if (error instanceof ApiError && error.status === 401) setToken(null);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const accept = useCallback(({ user, token }: AuthResult) => {
    setToken(token);
    setUser(user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) =>
      accept(await api.login(email, password)),
    [accept],
  );
  const signup = useCallback(
    async (input: SignupInput) => accept(await api.signup(input)),
    [accept],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // se limpia la sesión local aunque el servidor falle
    }
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading, login, signup, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
}
