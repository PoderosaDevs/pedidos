import * as React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DataTablePedidos } from "./DataTablePedidos";
import type { Pedido } from "./types";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "https://api-pedidos-w1sg.onrender.com";

// 🔹 utilitário para fetch com cookie
async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
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

export default function PedidosPage() {
  const [openNovo, setOpenNovo] = React.useState(false);
  const [openNovoCliente, setOpenNovoCliente] = React.useState(false);

  const [clientes, setClientes] = React.useState<
    { id: number; nome: string }[]
  >([]);

  const [lojas, setLojas] = React.useState<
    { id: number; nome: string }[]
  >([]);

  const [pedidos, setPedidos] = React.useState<Pedido[]>([]);
  const [loadingPedido, setLoadingPedido] = React.useState(false);
  const [loadingCliente, setLoadingCliente] = React.useState(false);
  console.log("Pedidos:", pedidos);
  // 🔹 enums mapeados com label amigável
  const situacoes = [
    { value: "ALTERACAO_DE_ENDERECO", label: "Alteração de endereço" },
    { value: "ATRASO_NA_ENTREGA", label: "Atraso na entrega" },
    { value: "AVARIA_DE_PRODUCAO", label: "Avaria de produção" },
    { value: "BARRAR_A_ENTREGA", label: "Barrar a entrega" },
    { value: "CANCELAMENTO", label: "Cancelamento" },
    { value: "DEVOLUCAO", label: "Devolução" },
    { value: "ENTREGUE_E_NAO_RECEBIDO", label: "Entregue e não recebido" },
    { value: "ERRO_DE_ENDERECO", label: "Erro de endereço" },
    { value: "FALTANDO_ITEM", label: "Faltando item" },
  ];

  const prioridades = [
    { value: "BAIXA", label: "Baixa" },
    { value: "MEDIA", label: "Média" },
    { value: "ALTA", label: "Alta" },
  ];

  // 🔹 Funções auxiliares
  async function refetchClientes() {
    try {
      const data = await apiFetch("/clientes");
      setClientes(data?.map((c: any) => ({ id: c.id, nome: c.nome })) || []);
    } catch {
      setClientes([]);
    }
  }

  async function refetchLojas() {
    try {
      const data = await apiFetch("/lojas");
      setLojas(data?.map((l: any) => ({ id: l.id, nome: l.nome })) || []);
    } catch {
      setLojas([]);
    }
  }

  async function refetchPedidos() {
    try {
      const data = await apiFetch("/pedidos");
      setPedidos(data || []);
    } catch {
      setPedidos([]);
    }
  }

  React.useEffect(() => {
    refetchClientes();
    refetchLojas(); // ✅ AGORA BUSCA LOJAS AO CARREGAR
    refetchPedidos();
  }, []);

  // 🧾 Formik - Novo Pedido
  const formikPedido = useFormik({
    initialValues: {
      numeroPedido: "",
      numeroChamado: "",
      numeroJit: "",
      descricao: "",
      resolucao: "",
      prioridade: "MEDIA",
      situacao: "FALTANDO_ITEM",
      clienteId: "",
      lojaId: "", // ✅ ADICIONADO AQUI
      criadoPorId: "",
    },
    validationSchema: Yup.object({
      numeroPedido: Yup.string().required("Obrigatório"),
      descricao: Yup.string().required("Obrigatório"),
      prioridade: Yup.string().required("Obrigatório"),
      situacao: Yup.string().required("Obrigatório"),
      clienteId: Yup.string().required("Obrigatório"),
      lojaId: Yup.string().required("Obrigatório"), // ✅ VALIDAÇÃO
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoadingPedido(true);
      try {
        const payload = {
          ...values,
          clienteId: Number(values.clienteId),
          lojaId: Number(values.lojaId), // ✅ INCLUÍDO NO PAYLOAD
          ...(values.resolucao ? { resolucao: values.resolucao } : {}),
        };

        await apiFetch("/pedidos/register", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        await refetchPedidos();
        alert("✅ Pedido criado com sucesso!");
        resetForm();
        setOpenNovo(false);
      } catch (err) {
        console.error(err);
        alert("❌ Falha ao criar pedido.");
      } finally {
        setLoadingPedido(false);
      }
    },
  });

  // 🧾 Formik - Novo Cliente
  const formikCliente = useFormik({
    initialValues: { nome: "", cpf: "" },
    validationSchema: Yup.object({
      nome: Yup.string().required("Nome é obrigatório"),
      cpf: Yup.string().required("CPF é obrigatório"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoadingCliente(true);
      try {
        await apiFetch("/clientes/register", {
          method: "POST",
          body: JSON.stringify(values),
        });

        await refetchClientes();
        alert("✅ Cliente adicionado!");
        resetForm();
        setOpenNovoCliente(false);
      } catch (err) {
        console.error(err);
        alert("❌ Falha ao adicionar cliente.");
      } finally {
        setLoadingCliente(false);
      }
    },
  });

  return (
    <div className="space-y-8 text-white">

  

      {/* Tabela */}
      <DataTablePedidos onNovoPedido={() => setOpenNovo(true)} />

      {/* Sheet Novo Pedido */}
      <Sheet open={openNovo} onOpenChange={setOpenNovo}>
        <SheetContent
          side="right"
          className="bg-zinc-900 text-gray-100 border-l border-zinc-800 w-[480px] px-6 py-6"
        >
          <form onSubmit={formikPedido.handleSubmit}>
            <SheetHeader>
              <SheetTitle className="text-white text-2xl">
                Novo Pedido
              </SheetTitle>
              <SheetDescription className="text-lg text-gray-300">
                Criação de pedido
              </SheetDescription>
            </SheetHeader>

            <Separator className="mb-4 bg-zinc-800" />

            {/* EXATAMENTE O SEU FORM ORIGINAL — SOMENTE COM O CAMPO LOJA ADICIONADO */}

            <div className="space-y-4">
              <div>
                <Label>N° do Pedido</Label>
                <Input
                  name="numeroPedido"
                  onChange={formikPedido.handleChange}
                  value={formikPedido.values.numeroPedido}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>N° do Chamado</Label>
                  <Input
                    name="numeroChamado"
                    onChange={formikPedido.handleChange}
                    value={formikPedido.values.numeroChamado}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <Label>N° JIT</Label>
                  <Input
                    name="numeroJit"
                    onChange={formikPedido.handleChange}
                    value={formikPedido.values.numeroJit}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Input
                  name="descricao"
                  onChange={formikPedido.handleChange}
                  value={formikPedido.values.descricao}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              {/* Resolução opcional */}
              <div>
                <Label>Resolução (opcional)</Label>
                <Input
                  name="resolucao"
                  onChange={formikPedido.handleChange}
                  value={formikPedido.values.resolucao}
                  placeholder="Preencha apenas após resolver o problema"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              {/* ⭐⭐⭐ CAMPO DE LOJA ADICIONADO AQUI ⭐⭐⭐ */}
              <div>
                <Label>Loja</Label>
                <Select
                  onValueChange={(val) =>
                    formikPedido.setFieldValue("lojaId", val)
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecione uma loja" />
                  </SelectTrigger>
                  <SelectContent>
                    {lojas.map((l) => (
                      <SelectItem key={l.id} value={l.id.toString()}>
                        {l.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* ⭐⭐⭐ FIM DO CAMPO DE LOJA ⭐⭐⭐ */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioridade</Label>
                  <Select
                    onValueChange={(val) =>
                      formikPedido.setFieldValue("prioridade", val)
                    }
                    defaultValue={formikPedido.values.prioridade}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {prioridades.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Situação</Label>
                  <Select
                    onValueChange={(val) =>
                      formikPedido.setFieldValue("situacao", val)
                    }
                    defaultValue={formikPedido.values.situacao}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {situacoes.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Cliente</Label>
                <Select
                  onValueChange={(val) =>
                    val === "novo"
                      ? setOpenNovoCliente(true)
                      : formikPedido.setFieldValue("clienteId", val)
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nome}
                      </SelectItem>
                    ))}
                    <SelectItem value="novo">+ Novo cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SheetFooter className="mt-6 flex flex-col-reverse gap-4">
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="border-none text-gray-900 hover:bg-red-800 hover:text-gray-200 cursor-pointer"
                >
                  Cancelar
                </Button>
              </SheetClose>
              <Button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600"
                disabled={loadingPedido}
              >
                {loadingPedido ? "Salvando..." : "Salvar Pedido"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Sheet Novo Cliente */}
      <Sheet open={openNovoCliente} onOpenChange={setOpenNovoCliente}>
        <SheetContent
          side="right"
          className="bg-zinc-900 text-gray-100 border-l border-zinc-800 w-[360px] px-6 py-6"
        >
          <form onSubmit={formikCliente.handleSubmit}>
            <SheetHeader>
              <SheetTitle className="text-white text-2xl">
                Novo Cliente
              </SheetTitle>
              <SheetDescription className="text-gray-300">
                Adicione um novo cliente.
              </SheetDescription>
            </SheetHeader>

            <Separator className="mb-4 bg-zinc-800" />

            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  name="nome"
                  onChange={formikCliente.handleChange}
                  value={formikCliente.values.nome}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <Label>CPF</Label>
                <Input
                  name="cpf"
                  onChange={formikCliente.handleChange}
                  value={formikCliente.values.cpf}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <SheetFooter className="mt-6 flex flex-col-reverse gap-4">
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="border-none text-gray-900 hover:bg-red-800 hover:text-gray-200"
                >
                  Cancelar
                </Button>
              </SheetClose>
              <Button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600"
                disabled={loadingCliente}
              >
                {loadingCliente ? "Salvando..." : "Salvar Cliente"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
