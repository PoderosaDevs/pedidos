import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconArrowLeft,
} from "@tabler/icons-react";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Erro na requisição");
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

interface LojaResumo {
  id: number;
  nome: string;
}

interface Canal {
  id: number;
  nome: string;
  descricao?: string | null;
  lojas?: LojaResumo[];
}

export default function ModuloCanais({ onClose }: { onClose: () => void }) {
  const [canais, setCanais] = React.useState<Canal[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [openForm, setOpenForm] = React.useState(false);
  const [editing, setEditing] = React.useState<Canal | null>(null);
  const [search, setSearch] = React.useState("");

  const [formData, setFormData] = React.useState({
    nome: "",
    descricao: "",
  });

  async function refetchCanais() {
    setLoading(true);
    try {
      const data = await apiFetch("/canais");
      setCanais(data || []);
    } catch (err) {
      console.error(err);
      setCanais([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refetchCanais();
  }, []);

  function handleNew() {
    setEditing(null);
    setFormData({ nome: "", descricao: "" });
    setOpenForm(true);
  }

  function handleEdit(canal: Canal) {
    setEditing(canal);
    setFormData({
      nome: canal.nome ?? "",
      descricao: canal.descricao ?? "",
    });
    setOpenForm(true);
  }

  async function handleDelete(canal: Canal) {
    const ok = window.confirm(
      `Tem certeza que deseja excluir o canal "${canal.nome}"?`
    );
    if (!ok) return;

    try {
      await apiFetch(`/canais/${canal.id}`, { method: "DELETE" });
      await refetchCanais();
      alert("Canal excluído com sucesso.");
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir canal.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (!formData.nome.trim()) {
        alert("Nome é obrigatório.");
        return;
      }

      if (editing) {
        await apiFetch(`/canais/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch(`/canais`, {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }

      await refetchCanais();
      setOpenForm(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar canal.");
    }
  }

  const filtered = canais.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 text-white">
      {/* ======== HEADER COM VOLTAR + NOVO ======== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Gerenciar Marketplaces</h1>
          <p className="text-sm text-gray-400 mt-1">
            Cadastre e gerencie marketplaces.
          </p>
        </div>
        <div className="flex items-center  gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-gray-300 px-4 py-2 rounded-lg
                           bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition"
          >
            <IconArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <Button
            onClick={handleNew}
            className="bg-pink-500 hover:bg-pink-600 cursor-pointer flex items-center gap-2"
          >
            <IconPlus className="h-4 w-4" />
            Novo Marketplace
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="py-4 px-4 flex flex-col">
          <div className="flex-1">
            <Label className="text-xs text-gray-400">Buscar por nome</Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Digite o nome do marketplace..."
              className="mt-1 bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <br />
          <div className="text-xs text-gray-500">
            {loading
              ? "Carregando..."
              : `${filtered.length} canais encontrados`}
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950/60 border-b border-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">
                Lojas Associadas
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-gray-500 text-sm"
                >
                  Nenhum canal encontrado.
                </td>
              </tr>
            )}

            {filtered.map((canal) => (
              <tr
                key={canal.id}
                className="border-t border-zinc-800 hover:bg-zinc-800/40"
              >
                <td className="px-4 py-3 text-xs text-gray-400">{canal.id}</td>
                <td className="px-4 py-3 text-sm text-gray-100">
                  {canal.nome}
                </td>
                <td className="px-4 py-3 text-xs text-gray-300">
                  {canal.lojas && canal.lojas.length > 0
                    ? canal.lojas.map((l) => l.nome).join(", ")
                    : "Sem lojas"}
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  <div className="flex justify-end gap-2">
                    {/* Botão Editar */}
                    <button
                      type="button"
                      onClick={() => handleEdit(canal)}
                      className="
      inline-flex items-center gap-1.5
      px-3 py-1.5 rounded-lg
      text-xs font-medium
      bg-zinc-800/80 text-zinc-100
      border border-zinc-700
      hover:bg-zinc-700 hover:border-zinc-400
      focus:outline-none focus:ring-2 focus:ring-pink-500/60
      transition-colors
    "
                    >
                      <IconPencil className="h-3.5 w-3.5" />
                      <span>Editar</span>
                    </button>

                    {/* Botão Deletar */}
                    <button
                      type="button"
                      onClick={() => handleDelete(canal)}
                      className="
      inline-flex items-center gap-1.5
      px-3 py-1.5 rounded-lg
      text-xs font-medium
      bg-red-950/60 text-red-200
      border border-red-700/70
      hover:bg-red-900 hover:border-red-500 hover:text-red-50
      focus:outline-none focus:ring-2 focus:ring-red-500/60
      transition-colors
    "
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet criar/editar canal */}
      <Sheet open={openForm} onOpenChange={setOpenForm}>
        <SheetContent
          side="right"
          className="bg-zinc-900 text-white border-l border-zinc-800 w-[420px] px-6 py-6"
        >
          <form onSubmit={handleSubmit}>
            <SheetHeader>
              <SheetTitle className="text-2xl text-white">
                {editing ? "Editar Canal" : "Novo Canal"}
              </SheetTitle>
              <SheetDescription className="text-gray-400">
                Preencha os dados do canal.
              </SheetDescription>
            </SheetHeader>

            <Separator className="my-4 bg-zinc-800" />

            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>

              <div>
                <Label>Descrição (opcional)</Label>
                <Input
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      descricao: e.target.value,
                    }))
                  }
                  className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Ex: Marketplace de canais digitais"
                />
              </div>
            </div>

            <SheetFooter className="mt-6 flex flex-col gap-3">
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="border-zinc-700 text-gray-300 hover:bg-red-800 hover:text-white"
                >
                  Cancelar
                </Button>
              </SheetClose>

              <Button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600 cursor-pointer"
              >
                Salvar
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
