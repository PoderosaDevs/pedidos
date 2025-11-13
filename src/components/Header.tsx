import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import Logo from '@/assets/logo.png';

interface HeaderProps {
  page: string;
  setPage: (page: string) => void;
}

export default function Header({ page, setPage }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNav = (target: string) => {
    setPage(target);
    navigate("/dashboard");
  };

  return (
    <header className="w-full bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => handleNav("dashboard")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img src={Logo} alt="" width={180} height={60} />
        </div>

        {/* Nav */}
        <nav className="flex space-x-6">
          <Button
            className={`text-lg font-medium transition ${
              page === "dashboard"
                ? "text-pink-400 border-b-2 border-pink-500 rounded-none bg-transparent"
                : "text-gray-400 bg-transparent hover:text-pink-400 cursor-pointer"
            }`}
            onClick={() => handleNav("dashboard")}
          >
            Dashboard
          </Button>
          <Button
            className={`text-lg font-medium transition ${
              page === "pedidos"
                ? "text-pink-400 border-b-2 border-pink-500 rounded-none bg-transparent"
                : "text-gray-400 bg-transparent hover:text-pink-400 cursor-pointer"
            }`}
            onClick={() => handleNav("pedidos")}
          >
            Pedidos
          </Button>
        </nav>

        {/* Profile */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <img
              src={user?.avatar}
              alt="avatar"
              className="w-9 h-9 rounded-full border border-zinc-700"
            />
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          <LogOut
            onClick={logout}
            className="text-gray-400 hover:text-red-500 cursor-pointer"
          />
        </div>
      </div>
    </header>
  );
}
