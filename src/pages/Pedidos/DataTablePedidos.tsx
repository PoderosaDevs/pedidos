import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  IconPlus,
  IconLayoutColumns,
  IconRefresh,
  IconEye,
  IconFilter,
} from "@tabler/icons-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
  SheetDescription,
} from "@/components/ui/sheet";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

import { Separator } from "@/components/ui/separator";

/* =========================================================
 *  TIPOS E ENUMS
 * =======================================================*/

export const Prioridade = {
  BAIXA: "BAIXA",
  MEDIA: "MEDIA",
  ALTA: "ALTA",
} as const;
export type Prioridade = (typeof Prioridade)[keyof typeof Prioridade];

export const Situacao = {
  ALTERACAO_DE_ENDERECO: "ALTERACAO_DE_ENDERECO",
  ATRASO_NA_ENTREGA: "ATRASO_NA_ENTREGA",
  AVARIA_DE_PRODUCAO: "AVARIA_DE_PRODUCAO",
  BARRAR_A_ENTREGA: "BARRAR_A_ENTREGA",
  CANCELAMENTO: "CANCELAMENTO",
  DEVOLUCAO: "DEVOLUCAO",
  ENTREGUE_E_NAO_RECEBIDO: "ENTREGUE_E_NAO_RECEBIDO",
  ERRO_DE_ENDERECO: "ERRO_DE_ENDERECO",
  FALTANDO_ITEM: "FALTANDO_ITEM",
} as const;
export type Situacao = (typeof Situacao)[keyof typeof Situacao];

export const Situation = {
  EM_ANDAMENTO: "EM_ANDAMENTO",
  FINALIZADO: "FINALIZADO",
  ATRASADO: "ATRASADO",
} as const;
export type Situation = (typeof Situation)[keyof typeof Situation];

export type Cliente = {
  id: number;
  nome: string;
};

export type Usuario = {
  id: number;
  nome: string;
};

export type Loja = {
  id: number;
  nome: string;
};

export type Pedido = {
  id: number;
  numeroPedido: string;
  numeroChamado?: string | null;
  numeroJit?: string | null;
  descricao?: string | null;
  resolucao?: string | null;
  dataInicio: string | Date;
  dataAtualizacao: string | Date;
  dataFinalizacao?: string | Date | null;
  prioridade: Prioridade;
  situacao?: Situacao | null;
  situation?: Situation | null;
  clienteId: number;
  cliente?: Cliente | null;
  lojaId: number;
  loja?: Loja | null;
  criadoPorId?: number | null;
  criadoPor?: Usuario | null;
};

/* =========================================================
 *  HELPERS
 * =======================================================*/

const prioridadeLabel: Record<Prioridade, string> = {
  [Prioridade.BAIXA]: "Baixa",
  [Prioridade.MEDIA]: "Média",
  [Prioridade.ALTA]: "Alta",
};

const situacaoLabel: Record<Situacao, string> = {
  [Situacao.ALTERACAO_DE_ENDERECO]: "Alteração de endereço",
  [Situacao.ATRASO_NA_ENTREGA]: "Atraso na entrega",
  [Situacao.AVARIA_DE_PRODUCAO]: "Avaria de produção",
  [Situacao.BARRAR_A_ENTREGA]: "Barrar a entrega",
  [Situacao.CANCELAMENTO]: "Cancelamento",
  [Situacao.DEVOLUCAO]: "Devolução",
  [Situacao.ENTREGUE_E_NAO_RECEBIDO]: "Entregue e não recebido",
  [Situacao.ERRO_DE_ENDERECO]: "Erro de endereço",
  [Situacao.FALTANDO_ITEM]: "Faltando item",
};

const situationLabel: Record<Situation, string> = {
  [Situation.EM_ANDAMENTO]: "Em andamento",
  [Situation.FINALIZADO]: "Finalizado",
  [Situation.ATRASADO]: "Atrasado",
};

function fmtData(value?: string | Date | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "danger" }) {
  const base =
    "px-2 py-0.5 rounded border text-xs";
  const tones: Record<typeof tone, string> = {
    neutral: "bg-zinc-800 border-zinc-700 text-gray-100",
    success: "bg-emerald-900/50 border-emerald-500/60 text-emerald-200",
    danger: "bg-red-900/40 border-red-500/60 text-red-200",
  } as any;
  return <span className={`${base} ${tones[tone]}`}>{children}</span>;
}

function isWithinRange(
  value: string | Date | null | undefined,
  from?: string,
  to?: string
) {
  if (!from && !to) return true;
  if (!value) return false;

  const date = new Date(value);
  if (isNaN(date.getTime())) return false;

  if (from) {
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    if (date < fromDate) return false;
  }

  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    if (date > toDate) return false;
  }

  return true;
}

/* =========================================================
 *  COLUMNS (COM CALLBACKS DE AÇÃO)
 * =======================================================*/

export const getColumns = (handlers: {
  onView: (pedido: Pedido) => void;
  onAddUpdate: (pedido: Pedido) => void;
  onFinalize: (pedido: Pedido) => void;
}): ColumnDef<Pedido>[] => [
  {
    accessorKey: "numeroPedido",
    header: "Nº Pedido",
    cell: ({ row }) => row.original.numeroPedido ?? "—",
  },
  {
    accessorKey: "numeroChamado",
    header: "Nº Chamado",
    cell: ({ row }) => row.original.numeroChamado ?? "—",
  },
  {
    accessorKey: "numeroJit",
    header: "Nº JIT",
    cell: ({ row }) => row.original.numeroJit ?? "—",
  },
  {
    accessorKey: "dataInicio",
    header: "Data de Início",
    cell: ({ row }) => fmtData(row.original.dataInicio),
  },
  {
    accessorKey: "dataAtualizacao",
    header: "Atualização",
    cell: ({ row }) => fmtData(row.original.dataAtualizacao),
  },
  {
    accessorKey: "prioridade",
    header: "Prioridade",
    cell: ({ row }) => {
      const p = row.original.prioridade;
      return p ? <Pill tone={p === "ALTA" ? "danger" : p === "MEDIA" ? "neutral" : "neutral"}>{prioridadeLabel[p]}</Pill> : "—";
    },
  },
  {
    accessorKey: "situacao",
    header: "Motivo",
    cell: ({ row }) => {
      const s = row.original.situacao;
      return s ? situacaoLabel[s] : "—";
    },
  },
  {
    accessorFn: (row) => row.cliente?.nome ?? "",
    id: "cliente",
    header: "Cliente",
    cell: ({ row }) => row.original.cliente?.nome ?? "—",
  },
  {
    accessorFn: (row) => row.loja?.nome ?? "",
    id: "loja",
    header: "Loja",
    cell: ({ row }) => row.original.loja?.nome ?? "—",
  },
  {
    accessorFn: (row) => row.criadoPor?.nome ?? "",
    id: "criadoPor",
    header: "Criado por",
    cell: ({ row }) => row.original.criadoPor?.nome ?? "—",
  },
  {
    accessorKey: "situation",
    header: "Situação",
    cell: ({ row }) => {
      const s = row.original.situation;
      if (!s) return "—";
      const tone: "neutral" | "success" | "danger" =
        s === "FINALIZADO" ? "success" : s === "ATRASADO" ? "danger" : "neutral";
      return <Pill tone={tone}>{situationLabel[s]}</Pill>;
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const pedido = row.original;

      return (
        <div className="flex items-center gap-2 justify-center">
          {/* Botão Ver (abre modal completo) */}
          <button
            className="flex items-center bg-blue-600 px-3 py-1 rounded-xl text-white hover:bg-blue-700 cursor-pointer text-xs"
            onClick={() => handlers.onView(pedido)}
          >
            <IconEye className="w-4 h-4 mr-1" /> Ver
          </button>

          {/* Botão Situação (menu com ações) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center bg-zinc-700 px-3 py-1 rounded-xl text-white hover:bg-zinc-600 cursor-pointer text-xs">
                ⚙ Situação
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-zinc-900 border border-zinc-700 text-white w-52"
            >
              <DropdownMenuItem
                className="text-xs cursor-pointer"
                onClick={() => handlers.onAddUpdate(pedido)}
              >
                ➕ Adicionar atualização
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs cursor-pointer"
                onClick={() => handlers.onFinalize(pedido)}
              >
                ✓ Finalizar pedido
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

// export “estático” caso precise em outro lugar
export const columns: ColumnDef<Pedido>[] = getColumns({
  onView: () => {},
  onAddUpdate: () => {},
  onFinalize: () => {},
});

/* =========================================================
 *  COMPONENTE PRINCIPAL
 * =======================================================*/

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export function DataTablePedidos({
  onNovoPedido,
}: {
  onNovoPedido: () => void;
}) {
  const [data, setData] = React.useState<Pedido[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [filters, setFilters] = React.useState({
    numeroPedido: "",
    prioridade: "",
    situacao: "",
    cliente: "",
    loja: "",
    criadoPor: "",
    dataInicioDe: "",
    dataInicioAte: "",
    atualizacaoDe: "",
    atualizacaoAte: "",
  });

  const [selectedPedido, setSelectedPedido] = React.useState<Pedido | null>(
    null
  );

  // modal de atualização
  const [updateModal, setUpdateModal] = React.useState<{
    open: boolean;
    pedido: Pedido | null;
  }>({ open: false, pedido: null });
  const [updateText, setUpdateText] = React.useState("");

  // modal de finalização
  const [finalModal, setFinalModal] = React.useState<{
    open: boolean;
    pedido: Pedido | null;
  }>({ open: false, pedido: null });
  const [finalText, setFinalText] = React.useState("");

  const hasActiveFilters = React.useMemo(
    () => Object.values(filters).some((v) => v && v !== ""),
    [filters]
  );

  const fetchPedidos = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/pedidos`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const pedidos: Pedido[] = await res.json();
      setData(pedidos);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // Sempre que mudar filtro, volta para a primeira página
  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [filters]);

  const filteredData = React.useMemo(() => {
    return data.filter((pedido) => {
      // Nº Pedido
      if (
        filters.numeroPedido &&
        !pedido.numeroPedido
          ?.toLowerCase()
          .includes(filters.numeroPedido.toLowerCase())
      ) {
        return false;
      }

      // Prioridade
      if (filters.prioridade && pedido.prioridade !== filters.prioridade) {
        return false;
      }

      // Situação (motivo)
      if (filters.situacao && pedido.situacao !== filters.situacao) {
        return false;
      }

      // Cliente
      if (
        filters.cliente &&
        !pedido.cliente?.nome
          .toLowerCase()
          .includes(filters.cliente.toLowerCase())
      ) {
        return false;
      }

      // Loja
      if (
        filters.loja &&
        !pedido.loja?.nome
          ?.toLowerCase()
          .includes(filters.loja.toLowerCase())
      ) {
        return false;
      }

      // Usuário criador
      if (
        filters.criadoPor &&
        !pedido.criadoPor?.nome
          .toLowerCase()
          .includes(filters.criadoPor.toLowerCase())
      ) {
        return false;
      }

      // Data de início
      if (
        (filters.dataInicioDe || filters.dataInicioAte) &&
        !isWithinRange(
          pedido.dataInicio,
          filters.dataInicioDe || undefined,
          filters.dataInicioAte || undefined
        )
      ) {
        return false;
      }

      // Atualização
      if (
        (filters.atualizacaoDe || filters.atualizacaoAte) &&
        !isWithinRange(
          pedido.dataAtualizacao,
          filters.atualizacaoDe || undefined,
          filters.atualizacaoAte || undefined
        )
      ) {
        return false;
      }

      return true;
    });
  }, [data, filters]);

  const tableColumns = React.useMemo(
    () =>
      getColumns({
        onView: (pedido) => setSelectedPedido(pedido),
        onAddUpdate: (pedido) => {
          setUpdateModal({ open: true, pedido });
          setUpdateText("");
        },
        onFinalize: (pedido) => {
          setFinalModal({ open: true, pedido });
          setFinalText("");
        },
      }),
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function handleFilterChange(
    field: keyof typeof filters,
    value: string
  ): void {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleClearFilters() {
    setFilters({
      numeroPedido: "",
      prioridade: "",
      situacao: "",
      cliente: "",
      loja: "",
      criadoPor: "",
      dataInicioDe: "",
      dataInicioAte: "",
      atualizacaoDe: "",
      atualizacaoAte: "",
    });
  }

  async function enviarAtualizacao() {
    if (!updateModal.pedido) return;
    if (!updateText.trim()) {
      alert("Descrição da atualização é obrigatória.");
      return;
    }

    try {
      await fetch(`${API_BASE}/pedidos/${updateModal.pedido.id}/atualizacoes`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao: updateText.trim() }),
      });
      setUpdateModal({ open: false, pedido: null });
      setUpdateText("");
      fetchPedidos();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar atualização.");
    }
  }

  async function enviarFinalizacao() {
    if (!finalModal.pedido) return;
    if (!finalText.trim()) {
      alert("A resolução final é obrigatória.");
      return;
    }

    try {
      await fetch(`${API_BASE}/pedidos/${finalModal.pedido.id}/finalizar`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolucao: finalText.trim() }),
      });
      setFinalModal({ open: false, pedido: null });
      setFinalText("");
      fetchPedidos();
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar pedido.");
    }
  }

  return (
    <>
      {/* Sheet de detalhes do pedido */}
      <Sheet
        open={!!selectedPedido}
        onOpenChange={(open) => {
          if (!open) setSelectedPedido(null);
        }}
      >
        <SheetContent
          side="right"
          className="bg-zinc-900 text-gray-100 border-l border-zinc-800 w-[450px] px-6 py-6"
        >
          <SheetHeader>
            <SheetTitle className="text-2xl">
              Pedido{" "}
              {selectedPedido?.numeroPedido
                ? `#${selectedPedido.numeroPedido}`
                : selectedPedido
                ? `#${selectedPedido.id}`
                : ""}
            </SheetTitle>
            <SheetDescription className="text-gray-400">
              Visão detalhada do pedido selecionado.
            </SheetDescription>
          </SheetHeader>

          <Separator className="my-4 bg-zinc-800" />

          {selectedPedido && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400">Nº Pedido</p>
                  <p className="font-semibold">
                    {selectedPedido.numeroPedido ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Nº Chamado</p>
                  <p>{selectedPedido.numeroChamado || "—"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400">Nº JIT</p>
                  <p>{selectedPedido.numeroJit || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Loja</p>
                  <p className="font-semibold">
                    {selectedPedido.loja?.nome || "—"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-gray-400">Cliente</p>
                <p className="font-semibold">
                  {selectedPedido.cliente?.nome || "—"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400">Prioridade</p>
                  <p className="font-semibold">
                    {selectedPedido.prioridade
                      ? prioridadeLabel[selectedPedido.prioridade]
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Motivo</p>
                  <p className="font-semibold">
                    {selectedPedido.situacao
                      ? situacaoLabel[selectedPedido.situacao]
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400">Situação</p>
                  <p>
                    {selectedPedido.situation
                      ? situationLabel[selectedPedido.situation]
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Início</p>
                  <p>{fmtData(selectedPedido.dataInicio)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400">Atualização</p>
                  <p>{fmtData(selectedPedido.dataAtualizacao)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Finalização</p>
                  <p>{fmtData(selectedPedido.dataFinalizacao)}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400">Descrição</p>
                <p>{selectedPedido.descricao || "—"}</p>
              </div>

              {selectedPedido.resolucao && (
                <div>
                  <p className="text-gray-400">Resolução final</p>
                  <p>{selectedPedido.resolucao}</p>
                </div>
              )}

              <div>
                <p className="text-gray-400">Criado por</p>
                <p>{selectedPedido.criadoPor?.nome || "—"}</p>
              </div>
            </div>
          )}

          <SheetFooter className="mt-6">
            <SheetClose asChild>
              <button className="bg-zinc-800 border border-zinc-700 text-gray-200 px-4 py-2 rounded hover:bg-zinc-700 cursor-pointer">
                Fechar
              </button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Modal: Adicionar atualização */}
      <AlertDialog open={updateModal.open}>
        <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Adicionar atualização</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Registre uma atualização sobre o andamento deste pedido.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <textarea
            className="w-full bg-zinc-800 border border-zinc-600 text-gray-100 p-2 rounded mt-3 text-sm"
            rows={4}
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            placeholder="Ex: Cliente confirmou endereço, aguardando reenvio..."
          />

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              onClick={() => {
                setUpdateModal({ open: false, pedido: null });
                setUpdateText("");
              }}
              className="bg-zinc-800 border border-zinc-700 text-gray-200 hover:bg-zinc-700"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={enviarAtualizacao}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Salvar atualização
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal: Finalizar pedido */}
      <AlertDialog open={finalModal.open}>
        <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar pedido</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Informe a resolução final. Após finalizado, o pedido será marcado
              como <strong>FINALIZADO</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <textarea
            className="w-full bg-zinc-800 border border-zinc-600 text-gray-100 p-2 rounded mt-3 text-sm"
            rows={4}
            value={finalText}
            onChange={(e) => setFinalText(e.target.value)}
            placeholder="Ex: Pedido entregue ao cliente em 20/11, problema resolvido..."
          />

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              onClick={() => {
                setFinalModal({ open: false, pedido: null });
                setFinalText("");
              }}
              className="bg-zinc-800 border border-zinc-700 text-gray-200 hover:bg-zinc-700"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={enviarFinalizacao}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Finalizar pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Card principal com tabela */}
      <Card className="bg-zinc-900 border-zinc-800 flex flex-col h-full">
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 pb-4">
          <CardTitle className="text-white text-xl">Pedidos</CardTitle>
          <div className="flex items-center gap-2">
            {/* Colunas */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-600 text-gray-100 cursor-pointer"
                >
                  <IconLayoutColumns /> Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-zinc-900 border-zinc-700 text-white"
              >
                {table
                  .getAllColumns()
                  .filter(
                    (c) => typeof c.accessorFn !== "undefined" && c.getCanHide()
                  )
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                      className="capitalize"
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Atualizar */}
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-600 text-gray-100 cursor-pointer"
              onClick={fetchPedidos}
              disabled={loading}
            >
              <IconRefresh
                className={loading ? "animate-spin text-pink-400" : ""}
              />{" "}
              Atualizar
            </Button>

            {/* Drawer de filtros */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-600 text-gray-100 cursor-pointer flex items-center gap-1"
                >
                  <IconFilter className="w-4 h-4" />
                  Filtros
                  {hasActiveFilters && (
                    <span className="ml-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-pink-500 text-[10px] text-white px-1">
                      ●
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-zinc-900 border-l border-zinc-800 text-gray-100 px-4 w-full sm:w-[380px]"
              >
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-white">Filtros</SheetTitle>
                </SheetHeader>

                <div className="space-y-4 overflow-auto max-h-[calc(100vh-150px)] pr-1">
                  {/* Nº Pedido */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Nº Pedido</label>
                    <input
                      type="text"
                      value={filters.numeroPedido}
                      onChange={(e) =>
                        handleFilterChange("numeroPedido", e.target.value)
                      }
                      placeholder="Digite o nº do pedido"
                      className="h-9 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
                    />
                  </div>

                  {/* Prioridade */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Prioridade</label>
                    <select
                      value={filters.prioridade}
                      onChange={(e) =>
                        handleFilterChange("prioridade", e.target.value)
                      }
                      className="h-9 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
                    >
                      <option value="">Todas</option>
                      {Object.entries(prioridadeLabel).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* Situação (motivo) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Motivo</label>
                    <select
                      value={filters.situacao}
                      onChange={(e) =>
                        handleFilterChange("situacao", e.target.value)
                      }
                      className="h-9 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
                    >
                      <option value="">Todos</option>
                      {Object.entries(situacaoLabel).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cliente */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Cliente</label>
                    <input
                      type="text"
                      value={filters.cliente}
                      onChange={(e) =>
                        handleFilterChange("cliente", e.target.value)
                      }
                      placeholder="Nome do cliente"
                      className="h-9 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
                    />
                  </div>

                  {/* Loja */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Loja</label>
                    <input
                      type="text"
                      value={filters.loja}
                      onChange={(e) =>
                        handleFilterChange("loja", e.target.value)
                      }
                      placeholder="Nome da loja"
                      className="h-9 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
                    />
                  </div>

                  {/* Usuário criador */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">
                      Usuário criador
                    </label>
                    <input
                      type="text"
                      value={filters.criadoPor}
                      onChange={(e) =>
                        handleFilterChange("criadoPor", e.target.value)
                      }
                      placeholder="Nome do usuário"
                      className="h-9 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
                    />
                  </div>

                  {/* Data de início */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">
                      Data de início (intervalo)
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="date"
                        value={filters.dataInicioDe}
                        onChange={(e) =>
                          handleFilterChange("dataInicioDe", e.target.value)
                        }
                        className="h-9 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
                      />
                      <span className="text-xs text-gray-500">até</span>
                      <input
                        type="date"
                        value={filters.dataInicioAte}
                        onChange={(e) =>
                          handleFilterChange("dataInicioAte", e.target.value)
                        }
                        className="h-9 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
                      />
                    </div>
                  </div>

                  {/* Atualização */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">
                      Data de atualização (intervalo)
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="date"
                        value={filters.atualizacaoDe}
                        onChange={(e) =>
                          handleFilterChange("atualizacaoDe", e.target.value)
                        }
                        className="h-9 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
                      />
                      <span className="text-xs text-gray-500">até</span>
                      <input
                        type="date"
                        value={filters.atualizacaoAte}
                        onChange={(e) =>
                          handleFilterChange("atualizacaoAte", e.target.value)
                        }
                        className="h-9 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
                      />
                    </div>
                  </div>
                </div>

                <SheetFooter className="mt-4 flex justify-between gap-2">
                  <button
                    className="border-zinc-700 text-sm bg-gray-200 rounded-sm py-1 px-3 font-semibold cursor-pointer text-gray-800 hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                  >
                    Limpar filtros
                  </button>

                  <SheetClose asChild>
                    <Button
                      size="lg"
                      className="bg-pink-500 text-sm hover:bg-pink-600 text-white cursor-pointer"
                    >
                      Aplicar
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {/* Novo Pedido */}
            <Button
              className="bg-pink-500 hover:bg-pink-600 text-white cursor-pointer"
              onClick={onNovoPedido}
            >
              <IconPlus /> Novo Pedido
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="h-full overflow-auto">
            {loading ? (
              <div className="text-center text-gray-400 py-6">
                Carregando pedidos...
              </div>
            ) : error ? (
              <div className="text-center text-red-400 py-6">{error}</div>
            ) : (
              <Table className="min-w-full text-center border-collapse">
                <TableHeader className="sticky top-0 bg-zinc-800/90 backdrop-blur border-b border-zinc-700 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="text-gray-100 text-center font-medium py-3"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="py-3 text-gray-300"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={tableColumns.length}
                        className="h-24 text-center text-gray-400"
                      >
                        Nenhum pedido encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
