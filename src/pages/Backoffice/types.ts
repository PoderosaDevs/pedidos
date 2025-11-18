import { z } from "zod";

export const pedidoSchema = z.object({
  id: z.number(),
  cliente: z.string(),
  total: z.string(),
  status: z.enum(["Pago", "Pendente", "Enviado"]),
  data: z.string(),
  
  // 🔹 Campo opcional adicionado
  resolucao: z.string().optional(),
});

export type Pedido = z.infer<typeof pedidoSchema>;
