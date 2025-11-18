import { Card, CardContent } from "@/components/ui/card";
import DeleteButton from "./ModuleDeleteButton";
import { Button } from "@/components/ui/button";

export default function ModuleTable({
  items,
  columns,
  onEdit,
  onDelete,
}: {
  items: any[];
  columns: { key: string; label: string }[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-zinc-800">
              {columns.map((c) => (
                <th key={c.key} className="py-2">{c.label}</th>
              ))}
              <th className="py-2 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="text-white">
            {items.map((item) => (
              <tr key={item.id} className="border-b border-zinc-800">
                {columns.map((c) => (
                  <td key={c.key} className="py-3">{item[c.key]}</td>
                ))}
                <td className="text-right flex gap-3 justify-end items-center pt-1">
                  <Button
                  className="cursor-pointer"
                    onClick={() => onEdit(item)}
                    variant="secondary"
                  >
                    Editar
                  </Button>

                  <DeleteButton onConfirm={() => onDelete(item)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
