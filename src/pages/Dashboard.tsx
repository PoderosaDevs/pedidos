import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  Clock,
  CheckCircle,
  Timer,
  Loader2,
  Eye,
  Settings,
  Plus,
  Check,
  History,
  CalendarClock,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ============================
   CONSTANTES E HELPERS DO MODAL
============================ */
const API_BASE = "https://api-pedidos-w1sg.onrender.com";

const prioridadeLabel: Record<string, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
};

const situacaoLabel: Record<string, string> = {
  ALTERACAO_DE_ENDERECO: "Alteração de endereço",
  ATRASO_NA_ENTREGA: "Atraso na entrega",
  AVARIA_DE_PRODUCAO: "Avaria de produção",
  BARRAR_A_ENTREGA: "Barrar a entrega",
  CANCELAMENTO: "Cancelamento",
  DEVOLUCAO: "Devolução",
  ENTREGUE_E_NAO_RECEBIDO: "Entregue e não recebido",
  ERRO_DE_ENDERECO: "Erro de endereço",
  FALTANDO_ITEM: "Faltando item",
};

function fmtData(value?: string | Date | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return (
    d.toLocaleDateString("pt-BR") +
    " " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
}

/* ============================
   Tipos
============================ */
type PedidoSummary = {
  id: number;
  numeroPedido: string;
  cliente: string;
  prioridade: "ALTA" | "MEDIA" | "BAIXA";
  situation: "PENDENTE" | "EM_ANDAMENTO" | "FINALIZADO" | "CANCELADO";
  dataReferencia: string;
  horasRestantes?: number;
  statusSLA?: "VENCIDO" | "CRITICO" | "ATENCAO" | "OK";
};

type PedidoDetalhado = {
  id: number;
  numeroPedido: string;
  descricao?: string;
  resolucao?: string;
  dataInicio: string;
  dataAtualizacao: string;
  prioridade: string;
  situacao?: string;
  cliente?: { nome: string };
  loja?: { nome: string };
  historico?: { id: number; data: string; descricao: string }[];
};

const SLA_CONFIG = { ALTA: 24, MEDIA: 24, BAIXA: 48 };

export default function Dashboard() {
  /* ============================
      ESTADOS GERAIS
  ============================ */
  const [listaTabela, setListaTabela] = useState<PedidoSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Estados de KPI
  const [kpis, setKpis] = useState({
    alta: 0,
    media: 0,
    baixa: 0,
    pendentes: 0,
    resolvidos: 0,
  });

  /* ============================
      ESTADOS DAS AÇÕES (MODAIS)
  ============================ */
  const [selectedPedido, setSelectedPedido] = useState<PedidoDetalhado | null>(
    null
  );

  const [updateModal, setUpdateModal] = useState<{
    open: boolean;
    pedidoId: number | null;
  }>({ open: false, pedidoId: null });
  const [updateText, setUpdateText] = useState("");

  const [finalModal, setFinalModal] = useState<{
    open: boolean;
    pedidoId: number | null;
  }>({ open: false, pedidoId: null });
  const [finalText, setFinalText] = useState("");

  /* ============================
      FETCH DE DADOS
  ============================ */
  const fetchDados = async () => {
    try {
      const response = await fetch(`${API_BASE}/pedidos/summary`);
      const data = await response.json();
      if (Array.isArray(data)) processarDados(data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
    const interval = setInterval(fetchDados, 60000);
    return () => clearInterval(interval);
  }, []);

  /* ============================
      LÓGICA DE PAGINAÇÃO
  ============================ */
  // Calcula índices
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Fatia os dados para renderizar apenas a página atual
  const currentItems = listaTabela.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(listaTabela.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reseta para a primeira página ao mudar a qtd
  };

  /* ============================
      LÓGICA DE ACTIONS (API)
  ============================ */
  const fetchPedidoById = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/pedidos/${id}`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const pedido = await res.json();
      setSelectedPedido(pedido);
    } catch (err) {
      console.error(err);
      alert("Erro ao buscar detalhes.");
    }
  };

  const enviarAtualizacao = async () => {
    if (!updateModal.pedidoId) return;
    if (!updateText.trim()) {
      alert("Descrição obrigatória.");
      return;
    }
    try {
      await fetch(`${API_BASE}/pedidos/${updateModal.pedidoId}/atualizacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao: updateText.trim() }),
      });
      setUpdateModal({ open: false, pedidoId: null });
      setUpdateText("");
      fetchDados();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar atualização.");
    }
  };

  const enviarFinalizacao = async () => {
    if (!finalModal.pedidoId) return;
    if (!finalText.trim()) {
      alert("Resolução obrigatória.");
      return;
    }
    try {
      await fetch(`${API_BASE}/pedidos/${finalModal.pedidoId}/finalizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolucao: finalText.trim() }),
      });
      setFinalModal({ open: false, pedidoId: null });
      setFinalText("");
      fetchDados();
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar pedido.");
    }
  };

  /* ============================
      PROCESSAMENTO DE DADOS
  ============================ */
  const processarDados = (dados: PedidoSummary[]) => {
    const agora = new Date().getTime();
    const stats = { alta: 0, media: 0, baixa: 0, pendentes: 0, resolvidos: 0 };

    dados.forEach((p) => {
      if (p.prioridade === "ALTA") stats.alta++;
      if (p.prioridade === "MEDIA") stats.media++;
      if (p.prioridade === "BAIXA") stats.baixa++;
      if (p.situation === "FINALIZADO" || p.situation === "CANCELADO")
        stats.resolvidos++;
      else stats.pendentes++;
    });

    setKpis(stats);
    // REMOVIDO: setTodosPedidos(dados); - Não era utilizado

    const pendentes = dados.filter(
      (p) => p.situation !== "FINALIZADO" && p.situation !== "CANCELADO"
    );
    const pendentesComSLA = pendentes.map((p) => {
      const ultimaInteracao = new Date(p.dataReferencia).getTime();
      const horasPassadas = (agora - ultimaInteracao) / (1000 * 60 * 60);
      const limiteHoras = SLA_CONFIG[p.prioridade] || 24;
      const horasRestantes = limiteHoras - horasPassadas;

      let statusSLA: PedidoSummary["statusSLA"] = "OK";
      if (horasRestantes < 0) statusSLA = "VENCIDO";
      else if (horasRestantes < 4) statusSLA = "CRITICO";
      else if (horasRestantes < 12) statusSLA = "ATENCAO";

      return { ...p, horasRestantes, statusSLA };
    });

    setListaTabela(
      pendentesComSLA.sort((a, b) => a.horasRestantes! - b.horasRestantes!)
    );
  };

  const getBadgeColor = (prioridade: string) => {
    switch (prioridade) {
      case "ALTA":
        return "text-red-400 border-red-400/30 bg-red-400/10";
      case "MEDIA":
        return "text-orange-400 border-orange-400/30 bg-orange-400/10";
      case "BAIXA":
        return "text-blue-400 border-blue-400/30 bg-blue-400/10";
      default:
        return "text-zinc-400 border-zinc-400/30";
    }
  };

  const formatarTempo = (horas?: number) => {
    if (horas === undefined) return "--";
    if (horas < 0) return `Vencido há ${Math.abs(horas).toFixed(1)}h`;
    return `${horas.toFixed(1)}h restantes`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white gap-2">
        <Loader2 className="animate-spin text-pink-500" /> Carregando
        dashboard...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="pb-6">
        <h1 className="text-3xl font-semibold text-white mb-2">
          Dashboard Operacional
        </h1>
        <p className="text-zinc-400">
          Visão geral de tickets e monitoramento de SLA.
        </p>
      </div>

      {/* Cards KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium">
              Prioridade Alta
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold text-white">{kpis.alta}</p>
            <AlertCircle className="text-red-500" size={24} />
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium">
              Prioridade Média
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold text-white">{kpis.media}</p>
            <AlertTriangle className="text-orange-400" size={24} />
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium">
              Prioridade Baixa
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold text-white">{kpis.baixa}</p>
            <ArrowDown className="text-blue-400" size={24} />
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium">
              Total Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold text-white">{kpis.pendentes}</p>
            <Clock className="text-zinc-400" size={24} />
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium">
              Total Resolvidos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold text-white">{kpis.resolvidos}</p>
            <CheckCircle className="text-green-400" size={24} />
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8 bg-zinc-800" />

      {/* Tabela SLA */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 bg-zinc-900/50 pb-4 gap-4">
          <div>
            <CardTitle className="text-gray-100 text-xl flex items-center gap-2">
              <Timer className="text-pink-500" /> Fila de Atendimento (SLA)
            </CardTitle>
            <p className="text-zinc-400 text-sm mt-1">
              Pedidos pendentes ordenados por urgência de atualização.
            </p>
          </div>
          <div className="flex gap-2">
            {listaTabela.some((p) => p.statusSLA === "VENCIDO") && (
              <span className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded border border-red-500/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Existem pedidos vencidos
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-zinc-950 text-gray-200 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Status SLA</th>
                  <th className="px-6 py-4">Pedido / Cliente</th>
                  <th className="px-6 py-4">Prioridade</th>
                  <th className="px-6 py-4">Última Interação</th>
                  <th className="px-6 py-4">Prazo Restante</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {currentItems.length > 0 ? (
                  currentItems.map((pedido) => (
                    <tr
                      key={pedido.id}
                      className="hover:bg-zinc-800/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        {pedido.statusSLA === "VENCIDO" && (
                          <div className="flex items-center gap-2 text-red-500 font-medium bg-red-500/5 w-fit px-2 py-1 rounded">
                            <AlertCircle size={16} /> <span>Vencido</span>
                          </div>
                        )}
                        {pedido.statusSLA === "CRITICO" && (
                          <div className="flex items-center gap-2 text-orange-500 font-medium">
                            <AlertTriangle size={16} /> <span>Crítico</span>
                          </div>
                        )}
                        {pedido.statusSLA === "ATENCAO" && (
                          <div className="flex items-center gap-2 text-yellow-500 font-medium">
                            <Clock size={16} /> <span>Atenção</span>
                          </div>
                        )}
                        {pedido.statusSLA === "OK" && (
                          <div className="flex items-center gap-2 text-green-500 font-medium">
                            <CheckCircle size={16} /> <span>No Prazo</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium group-hover:text-pink-400 transition-colors">
                            #{pedido.numeroPedido || pedido.id}
                          </span>
                          <span
                            className="text-xs truncate max-w-[150px]"
                            title={pedido.cliente}
                          >
                            {pedido.cliente}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-[10px] tracking-wide font-bold border ${getBadgeColor(
                            pedido.prioridade
                          )}`}
                        >
                          {pedido.prioridade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">
                          {new Date(pedido.dataReferencia).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                        <span className="text-xs text-zinc-500 ml-2">
                          {new Date(pedido.dataReferencia).toLocaleTimeString(
                            "pt-BR",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-gray-200">
                        <span
                          className={
                            pedido.horasRestantes! < 0
                              ? "text-red-400 font-bold"
                              : ""
                          }
                        >
                          {formatarTempo(pedido.horasRestantes)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            className="flex items-center bg-blue-600 px-3 py-1 rounded-xl text-white hover:bg-blue-700 cursor-pointer text-xs"
                            onClick={() => fetchPedidoById(pedido.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" /> Ver
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center bg-zinc-700 px-3 py-1 rounded-xl text-white hover:bg-zinc-600 cursor-pointer text-xs">
                                <Settings className="w-4 h-4 mr-1" /> Situação
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-zinc-900 border border-zinc-700 text-white w-52"
                            >
                              <DropdownMenuItem
                                className="text-xs cursor-pointer focus:bg-zinc-800 focus:text-white"
                                onClick={() => {
                                  setUpdateModal({
                                    open: true,
                                    pedidoId: pedido.id,
                                  });
                                  setUpdateText("");
                                }}
                              >
                                <Plus className="w-3 h-3 mr-2" /> Adicionar
                                atualização
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs cursor-pointer focus:bg-zinc-800 focus:text-white"
                                onClick={() => {
                                  setFinalModal({
                                    open: true,
                                    pedidoId: pedido.id,
                                  });
                                  setFinalText("");
                                }}
                              >
                                <Check className="w-3 h-3 mr-2" /> Finalizar
                                pedido
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-zinc-500"
                    >
                      Nenhum pedido pendente no momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* RODAPÉ DA TABELA: PAGINAÇÃO */}
          {listaTabela.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-zinc-800 bg-zinc-950/30 text-sm text-zinc-400">
              {/* Info de Resultados */}
              <div>
                Mostrando{" "}
                <span className="text-white font-medium">
                  {indexOfFirstItem + 1}
                </span>{" "}
                até{" "}
                <span className="text-white font-medium">
                  {Math.min(indexOfLastItem, listaTabela.length)}
                </span>{" "}
                de{" "}
                <span className="text-white font-medium">
                  {listaTabela.length}
                </span>{" "}
                resultados
              </div>

              {/* Controles da Direita */}
              <div className="flex items-center gap-4">
                {/* Seletor de Itens por Página */}
                <div className="flex items-center gap-2">
                  <span>Linhas por página:</span>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="h-8 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-white focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botões de Navegação */}
                <div className="flex items-center gap-1">
                  <span className="mr-2 text-xs">
                    Página <span className="text-white">{currentPage}</span> de{" "}
                    <span className="text-white">{totalPages}</span>
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* =========================================================
                          MODAIS (Mantidos iguais)
      ========================================================= */}

      <AlertDialog
        open={!!selectedPedido}
        onOpenChange={(open) => {
          if (!open) setSelectedPedido(null);
        }}
      >
        <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-gray-100 max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">
              Pedido #{selectedPedido?.numeroPedido ?? selectedPedido?.id}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Detalhes completos e histórico de atualizações.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedPedido && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Cliente</p>
                  <p className="font-semibold">
                    {selectedPedido.cliente?.nome || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Loja</p>
                  <p className="font-semibold">
                    {selectedPedido.loja?.nome || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Prioridade</p>
                  <p>
                    {selectedPedido.prioridade
                      ? prioridadeLabel[selectedPedido.prioridade]
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Motivo</p>
                  <p>
                    {selectedPedido.situacao
                      ? situacaoLabel[selectedPedido.situacao]
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Início</p>
                  <p>{fmtData(selectedPedido.dataInicio)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Última atualização</p>
                  <p>{fmtData(selectedPedido.dataAtualizacao)}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Descrição</p>
                <p>{selectedPedido.descricao || "—"}</p>
              </div>
              {selectedPedido.resolucao && (
                <div>
                  <p className="text-gray-400 text-sm">Resolução</p>
                  <p>{selectedPedido.resolucao}</p>
                </div>
              )}

              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-pink-500" />
                  <h3 className="text-sm font-semibold text-gray-200">
                    Linha do Tempo
                  </h3>
                </div>
                <div className="bg-zinc-950/50 border border-zinc-800/60 rounded-lg p-4 max-h-[350px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-track]:bg-zinc-900/50">
                  {selectedPedido.historico?.length ? (
                    <div className="relative space-y-6 pl-2">
                      <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-zinc-800" />
                      {selectedPedido.historico
                        .sort(
                          (a, b) =>
                            new Date(b.data).getTime() -
                            new Date(a.data).getTime()
                        )
                        .map((h, index) => (
                          <div key={h.id} className="relative flex gap-4 group">
                            <div className="relative z-10 flex-none mt-1">
                              <div
                                className={`w-4 h-4 rounded-full border-2 border-zinc-900 ${
                                  index === 0
                                    ? "bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                                    : "bg-zinc-600 group-hover:bg-zinc-500 transition-colors"
                                }`}
                              />
                            </div>
                            <div className="flex-1 bg-zinc-900/80 border border-zinc-800 p-3 rounded-lg hover:border-zinc-700 transition-all group-hover:bg-zinc-800/80">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-1.5 bg-zinc-950 rounded text-zinc-400">
                                  <MessageSquare size={14} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-200 leading-relaxed">
                                    {h.descricao || "Atualização sem descrição"}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-500 font-medium">
                                    <CalendarClock size={12} />
                                    {fmtData(h.data)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 opacity-60">
                      <div className="p-3 bg-zinc-900 rounded-full">
                        <History className="w-6 h-6 text-zinc-500" />
                      </div>
                      <p className="text-sm text-zinc-400">
                        Nenhum registro no histórico.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter className="mt-6">
            <AlertDialogAction
              onClick={() => setSelectedPedido(null)}
              className="bg-zinc-700 hover:bg-zinc-600 text-white"
            >
              Fechar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            placeholder="Ex: Cliente confirmou endereço..."
          />
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              onClick={() => {
                setUpdateModal({ open: false, pedidoId: null });
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

      <AlertDialog open={finalModal.open}>
        <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar pedido</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Informe a resolução final. O pedido será marcado como{" "}
              <strong>FINALIZADO</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <textarea
            className="w-full bg-zinc-800 border border-zinc-600 text-gray-100 p-2 rounded mt-3 text-sm"
            rows={4}
            value={finalText}
            onChange={(e) => setFinalText(e.target.value)}
            placeholder="Ex: Pedido entregue..."
          />
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              onClick={() => {
                setFinalModal({ open: false, pedidoId: null });
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
    </div>
  );
}
