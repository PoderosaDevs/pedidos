import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register"; // ⬅ IMPORTANTE
import Header from "@/components/Header";
import { useState, type JSX } from "react";
import PedidosPage from "./pages/Pedidos";
import Footer from "./components/Footer";

function ProtectedLayout() {
  const { user } = useAuth();
  const [page, setPage] = useState<string>("dashboard");

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[#111111] text-gray-800 flex flex-col">
      <Header page={page} setPage={setPage} />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {page === "dashboard" && <Dashboard />}
        {page === "pedidos" && <PedidosPage />}
      </main>
      <Footer />
    </div>
  );
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Página de login */}
          <Route path="/" element={<Login />} />

          {/* Página de registro */}
          <Route path="/register" element={<Register />} />  {/* 👈 ADICIONADO */}

          {/* Área protegida */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <ProtectedLayout />
              </PrivateRoute>
            }
          />

          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
