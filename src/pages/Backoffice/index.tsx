import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { IconBuildingStore, IconUsers, IconShare } from "@tabler/icons-react";
import ModuloCanais from "./modules/ModuloCanais";
import ModuloLojas from "./modules/ModuloLojas";
import ModuloClientes from "./modules/ModuloClientes";



export default function Backoffice() {
  const [openModule, setOpenModule] = useState<
    null | "canais" | "lojas" | "clientes"
  >(null);

 const modules = [
  {
    id: "canais",
    name: "Gerenciar Canais",
    icon: <IconShare className="h-8 w-8 text-pink-400" />,
    desc: "Cadastre e gerencie canais de venda, atendimento e comunicação.",
  },
  {
    id: "lojas",
    name: "Gerenciar Lojas",
    icon: <IconBuildingStore className="h-8 w-8 text-blue-400" />,
    desc: "Gerencie lojas, filiais, unidades físicas e pontos de distribuição.",
  },
  {
    id: "clientes",
    name: "Gerenciar Clientes",
    icon: <IconUsers className="h-8 w-8 text-emerald-400" />,
    desc: "Crie, edite e organize sua base de clientes.",
  },
] as const;


  return (
    <div className="space-y-10 text-white">

      {/* Título */}
      {!openModule && (
        <h1 className="text-3xl font-semibold">Gerenciamento de Módulos</h1>
      )}

      {/* ======== Cards dos módulos (só aparece se nenhum módulo estiver aberto) ======== */}
      {!openModule && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {modules.map((mod) => (
            <Card
              key={mod.id}
              onClick={() => setOpenModule(mod.id)}
              className="bg-zinc-900 border-zinc-800 p-6 cursor-pointer hover:bg-zinc-800 transition"
            >
              <CardContent className="p-0 space-y-4">
                <div className="p-3 rounded-lg bg-zinc-800 inline-flex">
                  {mod.icon}
                </div>

                <h2 className="text-xl text-white font-semibold">{mod.name}</h2>
                <p className="text-gray-400 text-sm">{mod.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ======== Renderização condicional dos módulos ======== */}

      {openModule === "canais" && (
        <ModuloCanais onClose={() => setOpenModule(null)} />
      )}

      {openModule === "lojas" && (
        <ModuloLojas onClose={() => setOpenModule(null)} />
      )}

      {openModule === "clientes" && (
        <ModuloClientes onClose={() => setOpenModule(null)} />
      )}
    </div>
  );
}
