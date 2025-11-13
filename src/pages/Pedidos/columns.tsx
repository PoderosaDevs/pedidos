import { type ColumnDef } from "@tanstack/react-table";
import { ClienteViewer } from "./ClienteViewer";
import { DragHandle } from "./DragHandle";
import { Badge } from "@/components/ui/badge";
import { IconCircleCheckFilled, IconClock, IconSend, IconDotsVertical } from "@tabler/icons-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { type Pedido } from "./types";

export const columns: ColumnDef<Pedido>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    accessorKey: "cliente",
    header: () => <div className="text-center text-white">Cliente</div>,
    cell: ({ row }) => (
      <div className="text-center text-white">
        <ClienteViewer item={row.original} />
      </div>
    ),
  },
  {
    accessorKey: "total",
    header: () => <div className="text-center text-white">Total</div>,
    cell: ({ row }) => <div className="text-center text-gray-100">{row.original.total}</div>,
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center text-white">Status</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge variant="outline" className="px-2 py-0.5 border-zinc-700 text-white text-xs">
          {row.original.status === "Pago" ? (
            <IconCircleCheckFilled className="mr-1 size-4 fill-green-500" />
          ) : row.original.status === "Pendente" ? (
            <IconClock className="mr-1 size-4 text-yellow-400" />
          ) : (
            <IconSend className="mr-1 size-4 text-pink-400" />
          )}
          {row.original.status}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "data",
    header: () => <div className="text-center text-white">Data</div>,
    cell: ({ row }) => <div className="text-center text-gray-100">{row.original.data}</div>,
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white size-8">
            <IconDotsVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-zinc-900 border-zinc-700 text-white">
          <DropdownMenuItem>Editar</DropdownMenuItem>
          <DropdownMenuItem>Duplicar</DropdownMenuItem>
          <DropdownMenuItem>Favoritar</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-400">Excluir</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
