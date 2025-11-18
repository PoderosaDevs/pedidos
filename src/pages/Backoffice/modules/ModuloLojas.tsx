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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";
import { IconArrowLeft } from "@tabler/icons-react";

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

interface CanalResumo {
  id: number;
  nome: string;
}

interface Loja {
  id: number;
  nome: string;
  canalId: number;
  canal?: CanalResumo;
}

export default function ModuloLojas({ onClose }: { onClose: () => void }) {
  const [lojas, setLojas] = React.useState<Loja[]>([]);
  const [canais, setCanais] = React.useState<CanalResumo[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [openForm, setOpenForm] = React.useState(false);
  const [editing, setEditing] = React.useState<Loja | null>(null);
  const [search, setSearch] = React.useState("");

  const [formData, setFormData] = React.useState({
    nome: "",
    canalId: "",
  });

  async function refetchLojas() {
    setLoading(true);
    try {
      const data = await apiFetch("/lojas");
      setLojas(data || []);
    } catch (err) {
      console.error(err);
      setLojas([]);
    } finally {
      setLoading(false);
    }
  }

  async function refetchCanais() {
    try {
      const data = await apiFetch("/canais");
      setCanais(
        (data || []).map((c: any) => ({
          id: c.id,
          nome: c.nome,
        }))
      );
    } catch (err) {
      console.error(err);
      setCanais([]);
    }
  }

  React.useEffect(() => {
    refetchLojas();
    refetchCanais();
  }, []);

  function handleNew() {
    setEditing(null);
    setFormData({ nome: "", canalId: "" });
    setOpenForm(true);
  }

  function handleEdit(loja: Loja) {
    setEditing(loja);
    setFormData({
      nome: loja.nome ?? "",
      canalId: String(loja.canalId ?? ""),
    });
    setOpenForm(true);
  }

  async function handleDelete(loja: Loja) {
    const ok = window.confirm(
      `Tem certeza que deseja excluir a loja "${loja.nome}"?`
    );
    if (!ok) return;

    try {
      await apiFetch(`/lojas/${loja.id}`, { method: "DELETE" });
      await refetchLojas();
      alert("Loja excluída com sucesso.");
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir loja.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.canalId) {
      alert("Nome e Canal são obrigatórios.");
      return;
    }

    const payload = {
      nome: formData.nome.trim(),
      canalId: Number(formData.canalId),
    };

    try {
      if (editing) {
        await apiFetch(`/lojas/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(`/lojas`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      await refetchLojas();
      setOpenForm(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar loja.");
    }
  }

  const filtered = lojas.filter((l) =>
    l.nome.toLowerCase().includes(search.toLowerCase())
  );

  function getCanalNome(canalId: number, canal?: CanalResumo) {
    if (canal && canal.nome) return canal.nome;
    const found = canais.find((c) => c.id === canalId);
    return found?.nome || `ID ${canalId}`;
  }

  return (
    <div className="space-y-8 text-white">
      {/* ======== HEADER COM VOLTAR + NOVO ======== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Gerenciar Lojas</h1>
          <p className="text-sm text-gray-400 mt-1">
            Cadastre e gerencie lojas associadas aos canais.
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
            Nova Loja
          </Button>
        </div>
      </div>

      {/* Filtro */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="py-4 px-4 flex flex-col ">
          <div className="flex-1">
            <Label className="text-xs text-gray-400">Buscar por nome</Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Digite o nome da loja..."
              className="mt-1 bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <br />

          <div className="text-xs text-gray-500">
            {loading ? "Carregando..." : `${filtered.length} lojas encontradas`}
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
                Canal
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
                  Nenhuma loja encontrada.
                </td>
              </tr>
            )}

            {filtered.map((loja) => (
              <tr
                key={loja.id}
                className="border-t border-zinc-800 hover:bg-zinc-800/40"
              >
                <td className="px-4 py-3 text-xs text-gray-400">{loja.id}</td>
                <td className="px-4 py-3 text-sm text-gray-100">{loja.nome}</td>
                <td className="px-4 py-3 text-xs text-gray-300">
                  {getCanalNome(loja.canalId, loja.canal)}
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  <div className="flex justify-end gap-2">
                    {/* Botão Editar */}
                    <button
                      type="button"
                      onClick={() => handleEdit(loja)}
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
                      onClick={() => handleDelete(loja)}
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

      {/* Sheet criar/editar loja */}
      <Sheet open={openForm} onOpenChange={setOpenForm}>
        <SheetContent
          side="right"
          className="bg-zinc-900 text-white border-l border-zinc-800 w-[420px] px-6 py-6"
        >
          <form onSubmit={handleSubmit}>
            <SheetHeader>
              <SheetTitle className="text-2xl text-white">
                {editing ? "Editar Loja" : "Nova Loja"}
              </SheetTitle>
              <SheetDescription className="text-gray-400">
                Preencha os dados da loja.
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

              <div className="w-full">
                <Label>Canal</Label>

                <Select
                  value={formData.canalId}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, canalId: v }))
                  }
                >
                  <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecione um canal" />
                  </SelectTrigger>

                  <SelectContent className="w-full">
                    {canais.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SheetFooter className="mt-6 flex flex-col gap-3">
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-zinc-700 border-zinc-700 text-gray-300 hover:bg-red-800 hover:text-white transition-colors"
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
