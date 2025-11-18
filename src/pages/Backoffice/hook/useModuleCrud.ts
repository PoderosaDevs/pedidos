import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export default function useModuleCrud(endpoint: string) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`${API_BASE}${endpoint}`, {
      credentials: "include",
    });
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  async function create(data: any) {
    await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    load(); // REFRESH
  }

  async function update(id: number, data: any) {
    await fetch(`${API_BASE}${endpoint}/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    load(); // REFRESH
  }

  async function remove(id: number) {
    await fetch(`${API_BASE}${endpoint}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    load(); // REFRESH
  }

  useEffect(() => {
    load();
  }, []);

  return { items, loading, create, update, remove, refetch: load };
}
