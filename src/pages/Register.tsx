import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

import Logo from "@/assets/logo.png";

const features = [
  "Gestão completa de clientes",
  "Controle financeiro simplificado",
  "Histórico de pedidos e serviços",
];

export default function Register() {
  const { register } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("As senhas não coincidem!"); // Idealmente, use um Toast aqui
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100">
      
      {/* ===== Lado Esquerdo: Decorativo (Invertido em relação ao Login) ===== */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-[#0a0a0b] items-center justify-center border-r border-zinc-900">
        <div className="absolute inset-0 w-full h-full">
           <div className="absolute top-[10%] right-[10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[100px]" />
           <div className="absolute bottom-[10%] left-[10%] w-[60%] h-[60%] bg-pink-600/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 p-12 max-w-lg">
          <h2 className="text-3xl font-bold text-white mb-6">
            Comece sua jornada com a <span className="text-pink-500">Poderosa Beleza</span>
          </h2>
          <div className="space-y-4">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/50 backdrop-blur-sm">
                <CheckCircle2 className="h-5 w-5 text-pink-500" />
                <span className="text-zinc-200">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Lado Direito: Formulário ===== */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center lg:hidden">
            <img src={Logo} width={120} alt="Logo" />
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Crie sua conta
            </h1>
            <p className="text-zinc-400">
              Preencha os dados abaixo para começar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">Nome completo</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="bg-zinc-900/50 border-zinc-800 text-white focus:border-pink-500 focus:ring-pink-500/20"
              />
            </div>

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
                className="bg-zinc-900/50 border-zinc-800 text-white focus:border-pink-500 focus:ring-pink-500/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-zinc-900/50 border-zinc-800 text-white focus:border-pink-500 focus:ring-pink-500/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-zinc-300">Confirmar</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="******"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-zinc-900/50 border-zinc-800 text-white focus:border-pink-500 focus:ring-pink-500/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando conta...
                </>
              ) : (
                <>
                  Criar conta <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            Já tem uma conta?{" "}
            <Link
              to="/"
              className="font-medium text-pink-400 hover:text-pink-300 transition-colors hover:underline"
            >
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}