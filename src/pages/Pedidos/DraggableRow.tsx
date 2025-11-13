import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow, TableCell } from "@/components/ui/table";
import { flexRender, type Row } from "@tanstack/react-table";
import { type Pedido } from "./types";

/**
 * Linha da tabela que pode ser arrastada (drag & drop)
 */
export function DraggableRow({ row }: { row: Row<Pedido> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      ref={setNodeRef}
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      className={`
        relative z-0
        data-[dragging=true]:z-10
        data-[dragging=true]:opacity-80
        hover:bg-zinc-800/60
        transition-colors
      `}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className="align-middle text-center text-gray-100"
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
