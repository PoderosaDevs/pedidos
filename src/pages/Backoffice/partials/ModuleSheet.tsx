import { useEffect, useState } from "react";

export default function ModuleFormSheet({
  title,
  open,
  onOpenChange,
  fields,
  initialData,
  onSubmit,
}: any) {
  // Garante que fields sempre será array
  const safeFields = Array.isArray(fields) ? fields : [];

  const [formData, setFormData] = useState(initialData || {});
  const [optionsCache, setOptionsCache] = useState({} as Record<string, any[]>);

  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData]);

  // Carrega selects com blindagem TOTAL
  useEffect(() => {
    safeFields.forEach((f) => {
      if (f.type === "select" && f.optionsEndpoint) {
        fetch(f.optionsEndpoint)
          .then((r) => r.json())
          .then((data) => {
            setOptionsCache((prev) => ({
              ...prev,
              [f.name]: Array.isArray(data) ? data : [],
            }));
          })
          .catch(() => {
            setOptionsCache((prev) => ({
              ...prev,
              [f.name]: [],
            }));
          });
      }
    });
  }, [fields]);

  function handleChange(field: string, value: any) {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: any) {
    e.preventDefault();
    onSubmit(formData);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-start pt-20 z-50">
      <div className="relative bg-zinc-900 w-[450px] p-6 rounded-lg border border-zinc-700">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {safeFields.map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="text-sm mb-1">{field.label}</label>

              {/* TEXT */}
              {field.type === "text" && (
                <input
                  type="text"
                  className="bg-zinc-800 border border-zinc-700 p-2 rounded"
                  required={field.required}
                  value={formData[field.name] ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              )}

              {/* NUMBER */}
              {field.type === "number" && (
                <input
                  type="number"
                  className="bg-zinc-800 border border-zinc-700 p-2 rounded"
                  required={field.required}
                  value={formData[field.name] ?? ""}
                  onChange={(e) =>
                    handleChange(field.name, Number(e.target.value))
                  }
                />
              )}

              {/* SELECT */}
              {field.type === "select" && (
                <select
                  className="bg-zinc-800 border border-zinc-700 p-2 rounded"
                  required={field.required}
                  value={formData[field.name] ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {(optionsCache[field.name] ?? []).map((opt: any) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.nome}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Salvar
            </button>
          </div>
        </form>

        <button
          className="absolute top-4 right-4 text-red-400 text-sm"
          onClick={() => onOpenChange(false)}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
