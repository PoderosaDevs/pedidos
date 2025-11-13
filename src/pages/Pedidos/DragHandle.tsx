import { useSortable } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { IconGripVertical } from "@tabler/icons-react";

export function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id });
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-gray-400 size-7 hover:bg-transparent"
    >
      <IconGripVertical className="size-4" />
      <span className="sr-only">Arraste para reordenar</span>
    </Button>
  );
}
