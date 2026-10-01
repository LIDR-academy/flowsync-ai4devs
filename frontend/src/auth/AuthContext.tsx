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
  /** true si `user` viene de GET /account/profile (no de login/signup). */
  hydrated: boolean;
  /** Aviso para mostrar en /login (sesión caducada, fallo de red…). */
  notice: string | null;
  clearNotice: () => void;
  expireSession: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => getToken() !== null);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Hidrata la sesión si ya hay un token guardado.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    api
      .profile()
      .then((profile) => {
        if (cancelled) return;
        setUser(profile);
        setHydrated(true);
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          setToken(null);
          setNotice("Tu sesión ha caducado. Inicia sesión de nuevo.");
        } else {
          setNotice(
            "No se pudo verificar tu sesión. Inténtalo de nuevo más tarde.",
          );
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const accept = useCallback(({ user, token }: AuthResult) => {
    setToken(token);
    setUser(user);
    setHydrated(false);
    setNotice(null);
  }, []);

  const clearNotice = useCallback(() => setNotice(null), []);

  // Sesión rechazada por el servidor (401): solo limpieza local, sin POST.
  const expireSession = useCallback(() => {
    setToken(null);
    setUser(null);
    setNotice("Tu sesión ha caducado. Inicia sesión de nuevo.");
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
    () => ({
      user,
      loading,
      hydrated,
      notice,
      clearNotice,
      expireSession,
      login,
      signup,
      logout,
    }),
    [
      user,
      loading,
      hydrated,
      notice,
      clearNotice,
      expireSession,
      login,
      signup,
      logout,
    ],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
}
