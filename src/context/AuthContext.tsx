import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Define a URL base (ex: http://localhost:3000/usuarios)
const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "").concat("/usuarios") ??
  "http://localhost:3000/usuarios";

// Tipo do Usuário
interface User {
  id?: number;
  name: string;
  email: string;
  avatar: string;
}

// Tipo do Contexto
interface AuthContextType {
  user: User | null;
  loading: boolean; // ⬅ Adicionado para controlar o carregamento inicial
  login: (email: string, password: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Começa true para verificar a sessão
  const navigate = useNavigate();
  const location = useLocation();

  // ==============================================
  // 1. VERIFICAR SESSÃO AO CARREGAR (O FIX)
  // ==============================================
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Chama a rota /me que criamos no backend para ler o cookie
        const res = await fetch(`${API_BASE}/me`, {
          method: "GET",
          credentials: "include", // ⬅ IMPORTANTE: Envia o cookie para o back
        });

        if (res.ok) {
          const data = await res.json();
          
          // Gera avatar baseado no email
          const defaultAvatar =
            "https://api.dicebear.com/9.x/identicon/svg?seed=" +
            encodeURIComponent(data.email);

          setUser({
            id: data.id,
            name: data.nome,
            email: data.email,
            avatar: defaultAvatar,
          });
          
          // Se o usuário estiver na tela de login e for autenticado, manda pro dashboard
          if (location.pathname === "/" || location.pathname === "/login") {
            navigate("/dashboard");
          }
        }
      } catch (error) {
        // Se der erro ou 401, apenas segue a vida (usuário não logado)
        console.log("Sem sessão ativa.");
      } finally {
        setLoading(false); // Libera a renderização da tela
      }
    };

    checkSession();
  }, []); // Array vazio = roda apenas uma vez no mount

  // ==============================================
  // 2. LOGIN
  // ==============================================
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.error || "Credenciais inválidas");
      }

      const defaultAvatar =
        "https://api.dicebear.com/9.x/identicon/svg?seed=" +
        encodeURIComponent(email);

      // Atualiza estado local
      setUser({
        name: data.user?.nome || email.split("@")[0],
        email,
        avatar: defaultAvatar,
      });

      navigate("/dashboard");
    } catch (e: any) {
      alert(e?.message || "Erro ao fazer login");
    }
  };

  // ==============================================
  // 3. REGISTRAR
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
        name: data.nome || nome,
        email: data.email || email,
        avatar: defaultAvatar,
      });

      navigate("/dashboard");
    } catch (err: any) {
      alert(err?.message || "Erro ao registrar usuário");
    }
  };

  // ==============================================
  // 4. LOGOUT
  // ==============================================
  const logout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e: any) {
      console.warn("Erro ao deslogar no servidor", e);
    } finally {
      setUser(null);
      navigate("/");
    }
  };

  // ==============================================
  // PROVIDER
  // ==============================================
  
  // Bloqueia a renderização dos filhos enquanto verifica a sessão
  // Isso evita que a tela de login pisque para quem já está logado
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-white">
        Carregando...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}

// Helper para evitar crash em respostas sem JSON
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}