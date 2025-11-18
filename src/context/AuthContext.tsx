import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "").concat("/usuarios") ??
  "http://localhost:3000/usuarios";


interface User {
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>; // ⬅ ADICIONADO
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // ==============================================
  // LOGIN
  // ==============================================
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, senha: password }),
      });

      if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.error || "Credenciais inválidas");
      }

      const defaultAvatar =
        "https://api.dicebear.com/9.x/identicon/svg?seed=" +
        encodeURIComponent(email);

      setUser({
        name: email.split("@")[0],
        email,
        avatar: defaultAvatar,
      });

      navigate("/dashboard");
    } catch (e: any) {
      alert(e?.message || "Erro ao fazer login");
    }
  };

  // ==============================================
  // REGISTER (CORRIGIDO)
  // ==============================================
  const register = async (nome: string, email: string, senha: string) => {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.error || "Erro ao registrar");
      }

      const defaultAvatar =
        "https://api.dicebear.com/9.x/identicon/svg?seed=" +
        encodeURIComponent(email);

      setUser({
        name: data.nome,
        email: data.email,
        avatar: defaultAvatar,
      });

      navigate("/dashboard");
    } catch (err: any) {
      alert(err?.message || "Erro ao registrar usuário");
    }
  };

  // ==============================================
  // LOGOUT
  // ==============================================
  const logout = async () => {
    try {
      const res = await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.error || "Falha ao sair");
      }
    } catch (e: any) {
      console.warn(e?.message || e);
    } finally {
      setUser(null);
      navigate("/");
    }
  };

  // ==============================================
  // PROVIDER
  // ==============================================
  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
