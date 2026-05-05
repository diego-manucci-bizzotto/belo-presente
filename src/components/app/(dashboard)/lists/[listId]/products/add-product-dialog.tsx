"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { AddProductForm } from "./add-product-form";

interface AddProductDialogProps {
  listId: string;
}

export function AddProductDialog({ listId }: AddProductDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#b1563c] text-white hover:bg-[#a0452f]">
          <Plus />
          <span className='hidden md:block'>Adicionar produto</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>📦 Adicionar produto</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do produto para adicioná-lo à lista.
          </DialogDescription>
        </DialogHeader>
        <AddProductForm
          listId={listId}
          handleSuccessAction={() => setIsOpen(false)}
          handleCancelAction={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
