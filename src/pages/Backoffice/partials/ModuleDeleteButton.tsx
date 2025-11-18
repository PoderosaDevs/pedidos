import { useState } from "react";
import { IconTrash } from "@tabler/icons-react";

export default function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-red-400 hover:text-red-300 cursor-pointer"
      >
        <IconTrash className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
            <p className="text-white">Confirmar exclusão?</p>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  onConfirm();
                  setOpen(false);
                }}
                className="text-red-400 hover:text-red-300"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
