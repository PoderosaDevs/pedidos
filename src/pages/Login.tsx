import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Logo from "@/assets/logo.png";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-gray-100">
      {/* ===== Fundo com gradiente MAIS VIVO (rosa + azul claro) ===== */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0a0a0b] via-[#111217] to-[#0a0a0b]" />
      <div className="absolute inset-0 -z-10 opacity-80">
        {/* mancha rosa viva */}
        <div className="absolute left-[-10%] top-[-10%] h-[55vh] w-[55vw] blur-3xl
                        bg-[radial-gradient(closest-side,_rgba(244,114,182,0.30),_transparent_70%)]" />
        {/* mancha azul clara */}
        <div className="absolute right-[-15%] top-[10%] h-[60vh] w-[55vw] blur-3xl
                        bg-[radial-gradient(closest-side,_rgba(96,165,250,0.28),_transparent_70%)]" />
        {/* leve ciano no rodapé */}
        <div className="absolute left-[20%] bottom-[-20%] h-[55vh] w-[55vw] blur-3xl
                        bg-[radial-gradient(closest-side,_rgba(34,211,238,0.18),_transparent_70%)]" />
      </div>

      {/* ===== Card de login ===== */}
      <Card className="w-[400px] bg-zinc-900/75 border border-zinc-800 backdrop-blur-xl shadow-[0_0_25px_rgba(0,0,0,0.45)]">
        <CardHeader className="flex flex-col items-center gap-3">
          <img
            src={Logo}
            width={160}
            alt="Poderosa Beleza"
            className=" h-auto drop-shadow-[0_0_12px_rgba(147,51,234,0.45)]"
          />
          <CardTitle className="text-center text-white text-2xl font-semibold tracking-wide">
            Acesso ao Painel
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              login(email, password);
            }}
            className="space-y-5"
          >
            {/* Campo Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                // fundo mais claro + contraste de texto
                className="bg-zinc-100 text-zinc-900 placeholder:text-zinc-500
                           border-zinc-300 focus:border-pink-500 focus:ring-pink-500"
              />
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-100 text-zinc-900 placeholder:text-zinc-500
                           border-zinc-300 focus:border-pink-500 focus:ring-pink-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer bg-pink-500 hover:bg-pink-600 text-white font-medium mt-2"
            >
              Entrar
            </Button>

            <p className="text-center text-xs text-gray-400 mt-4">
              © {new Date().getFullYear()} Poderosa Beleza — Todos os direitos reservados.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
