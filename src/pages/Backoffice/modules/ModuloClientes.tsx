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
  if (!res.ok) throw new Error(await res.text());
  try {
    return await res.json();
  } catch {
    return null;
  }
}

interface Cliente {
  id: number;
  nome: string;
  cpf?: string | null;
}

export default function ClientesPage({ onClose }: { onClose: () => void }) {
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [openForm, setOpenForm] = React.useState(false);
  const [editing, setEditing] = React.useState<Cliente | null>(null);
  const [search, setSearch] = React.useState("");

  const [formData, setFormData] = React.useState({
    nome: "",
    cpf: "",
  });

  async function refetchClientes() {
    setLoading(true);
    try {
      const data = await apiFetch("/clientes");
      setClientes(data || []);
    } catch {
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refetchClientes();
  }, []);

  function handleNew() {
    setEditing(null);
    setFormData({ nome: "", cpf: "" });
    setOpenForm(true);
  }

  function handleEdit(cliente: Cliente) {
    setEditing(cliente);
    setFormData({
      nome: cliente.nome ?? "",
      cpf: cliente.cpf ?? "",
    });
    setOpenForm(true);
  }

  async function handleDelete(cliente: Cliente) {
    const ok = window.confirm(`Excluir o cliente "${cliente.nome}"?`);
    if (!ok) return;
    await apiFetch(`/clientes/${cliente.id}`, { method: "DELETE" });
    await refetchClientes();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.nome.trim()) return alert("Nome é obrigatório.");
    if (!formData.cpf.trim()) return alert("CPF é obrigatório.");

    const payload = {
      nome: formData.nome.trim(),
      cpf: formData.cpf.trim(),
    };

    if (editing) {
      await apiFetch(`/clientes/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      await apiFetch(`/clientes/register`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    await refetchClientes();
    setOpenForm(false);
  }

  const filtered = clientes.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 text-white">
      {/* ======== HEADER COM VOLTAR + NOVO ======== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Gerenciar Clientes</h1>
          <p className="text-sm text-gray-400 mt-1">
            Cadastre e gerencie sua base de clientes.
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
            Novo Cliente
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
              placeholder="Digite o nome do cliente..."
              className="mt-1 bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
<br />
          <div className="text-xs text-gray-500">
            {loading
              ? "Carregando..."
              : `${filtered.length} clientes encontrados`}
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950/60 border-b border-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs text-gray-400">ID</th>
              <th className="px-4 py-3 text-left text-xs text-gray-400">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs text-gray-400">CPF</th>
              <th className="px-4 py-3 text-right text-xs text-gray-400">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cliente) => (
              <tr key={cliente.id} className="border-t border-zinc-800">
                <td className="px-4 py-3 text-xs text-gray-400">
                  {cliente.id}
                </td>
                <td className="px-4 py-3 text-sm text-gray-100">
                  {cliente.nome}
                </td>
                <td className="px-4 py-3 text-xs text-gray-300">
                  {cliente.cpf || "—"}
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  <div className="flex justify-end gap-2">
                    {/* Botão Editar */}
                    <button
                      type="button"
                      onClick={() => handleEdit(cliente)}
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
                      onClick={() => handleDelete(cliente)}
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

            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  Nenhum cliente encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sheet criar/editar */}
      <Sheet open={openForm} onOpenChange={setOpenForm}>
        <SheetContent
          side="right"
          className="bg-zinc-900 text-white border-l border-zinc-800 w-[420px] px-4 py-6"
        >
          <form onSubmit={handleSubmit}>
            <SheetHeader>
              <SheetTitle className="text-2xl text-white">
                {editing ? "Editar Cliente" : "Novo Cliente"}
              </SheetTitle>
              <SheetDescription className="text-gray-400">
                Preencha os dados do cliente.
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
                <Label>CPF</Label>
                <Input
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cpf: e.target.value }))
                  }
                  className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Somente números"
                  required
                />
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
