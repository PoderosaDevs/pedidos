import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

import Logo from "@/assets/logo.png";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100">
      {/* ===== Lado Esquerdo: Formulário ===== */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Logo Mobile (caso esconda o lado direito em telas pequenas) */}
          <div className="flex justify-center lg:justify-start">
            <img
              src={Logo}
              width={140}
              alt="Poderosa Beleza"
              className="h-auto drop-shadow-[0_0_12px_rgba(236,72,153,0.3)]"
            />
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Bem-vindo de volta
            </h1>
            <p className="text-zinc-400">
              Acesse seu painel para gerenciar seus chamados.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-pink-500 focus:ring-pink-500/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300">Senha</Label>
                <Link
                  to="#"
                  className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-pink-500 focus:ring-pink-500/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                </>
              ) : (
                <>
                  Entrar <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            Não tem uma conta?{" "}
            <Link
              to="/register"
              className="font-medium text-pink-400 hover:text-pink-300 transition-colors hover:underline"
            >
              Crie agora
            </Link>
          </p>
        </div>
      </div>

      {/* ===== Lado Direito: Decorativo (Estilo do novo layout com suas cores) ===== */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-[#0a0a0b] items-center justify-center border-l border-zinc-900">
        {/* Background Gradients (Manchas) */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-pink-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px]" />
        </div>

        {/* Conteúdo sobreposto */}
        <div className="relative z-10 p-12 text-center max-w-lg">
          <div className="mb-8 inline-flex p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm shadow-2xl shadow-pink-900/20">
             <img src={Logo} width={180} alt="Logo Grande" className="drop-shadow-lg" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Gerencie seu negócio com <span className="text-pink-500">estilo</span>.
          </h2>
          <p className="text-lg text-zinc-400">
            A plataforma completa para de clientes e pedidos.
          </p>
        </div>
      </div>
    </div>
  );
}