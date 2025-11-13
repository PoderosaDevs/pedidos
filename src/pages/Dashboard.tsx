import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, ShoppingCart, Users, Package, DollarSign } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const vendasData = [
  { mes: "Jan", valor: 12.4 },
  { mes: "Fev", valor: 10.8 },
  { mes: "Mar", valor: 14.2 },
  { mes: "Abr", valor: 9.7 },
  { mes: "Mai", valor: 15.3 },
  { mes: "Jun", valor: 16.1 },
];

const pedidosData = [
  { mes: "Jan", qtd: 65 },
  { mes: "Fev", qtd: 72 },
  { mes: "Mar", qtd: 81 },
  { mes: "Abr", qtd: 59 },
  { mes: "Mai", qtd: 90 },
  { mes: "Jun", qtd: 82 },
];

const clientesData = [
  { mes: "Jan", novos: 18 },
  { mes: "Fev", novos: 22 },
  { mes: "Mar", novos: 25 },
  { mes: "Abr", novos: 16 },
  { mes: "Mai", novos: 31 },
  { mes: "Jun", novos: 28 },
];

export default function Dashboard() {
  return (
    <div>

      {/* Cards KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-100 text-lg">Vendas Totais</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-semibold text-white">R$ 12.420</p>
            <TrendingUp className="text-green-400" size={30} />
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-100 text-lg">Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-semibold text-white">82</p>
            <ShoppingCart className="text-pink-400" size={30} />
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-100 text-lg">Clientes</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-semibold text-white">245</p>
            <Users className="text-pink-400" size={30} />
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-100 text-lg">Produtos Ativos</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-semibold text-white">58</p>
            <Package className="text-yellow-400" size={30} />
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-100 text-lg">Lucro</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-semibold text-white">R$ 3.280</p>
            <DollarSign className="text-emerald-400" size={30} />
          </CardContent>
        </Card>
      </div>

      {/* Separator entre KPIs e Charts */}
      <Separator className="my-8 bg-zinc-800" />

      {/* Linha com 3 Charts de Linha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-300 text-sm">Vendas (R$ mil)</CardTitle>
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vendasData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fill: "#a1a1aa", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#3f3f46" }} />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#3f3f46" }} />
                <Tooltip
                  contentStyle={{ background: "#0b0b0c", border: "1px solid #3f3f46", color: "#e5e7eb" }}
                  cursor={{ stroke: "#4f46e5", strokeOpacity: 0.3 }}
                />
                <Line type="monotone" dataKey="valor" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-300 text-sm">Pedidos (Qtd)</CardTitle>
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pedidosData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fill: "#a1a1aa", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#3f3f46" }} />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#3f3f46" }} />
                <Tooltip
                  contentStyle={{ background: "#0b0b0c", border: "1px solid #3f3f46", color: "#e5e7eb" }}
                  cursor={{ stroke: "#22d3ee", strokeOpacity: 0.3 }}
                />
                <Line type="monotone" dataKey="qtd" stroke="#22d3ee" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-300 text-sm">Clientes Novos (Qtd)</CardTitle>
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clientesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fill: "#a1a1aa", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#3f3f46" }} />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#3f3f46" }} />
                <Tooltip
                  contentStyle={{ background: "#0b0b0c", border: "1px solid #3f3f46", color: "#e5e7eb" }}
                  cursor={{ stroke: "#34d399", strokeOpacity: 0.3 }}
                />
                <Line type="monotone" dataKey="novos" stroke="#34d399" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
