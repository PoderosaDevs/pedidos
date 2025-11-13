import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Pedido } from "./types";

export function ClienteViewer({ item }: { item: Pedido }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-white px-0 hover:text-pink-400">
          {item.cliente}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-zinc-900 text-white border-t border-zinc-800 sm:max-w-lg sm:mx-auto">
        <DrawerHeader>
          <DrawerTitle>Pedido</DrawerTitle>
          <DrawerDescription className="text-gray-400">
            Detalhes rápidos do pedido
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-6 grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-200">Cliente</Label>
              <Input defaultValue={item.cliente} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <Label className="text-gray-200">Data</Label>
              <Input defaultValue={item.data} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-200">Total</Label>
              <Input defaultValue={item.total} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <Label className="text-gray-200">Status</Label>
              <Select defaultValue={item.status}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Enviado">Enviado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button className="bg-pink-500 hover:bg-pink-600">Salvar</Button>
          <DrawerClose asChild>
            <Button variant="outline" className="border-zinc-700 text-gray-300 hover:bg-zinc-800">
              Fechar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
