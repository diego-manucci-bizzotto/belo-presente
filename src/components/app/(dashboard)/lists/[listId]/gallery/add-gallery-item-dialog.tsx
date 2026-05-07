"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GalleryItemForm } from "@/components/app/(dashboard)/lists/[listId]/gallery/gallery-item-form";

interface AddGalleryItemDialogProps {
  listId: string;
}

export function AddGalleryItemDialog({ listId }: AddGalleryItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#b1563c] text-white hover:bg-[#a0452f]">
          <Plus />
          Adicionar imagem
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar imagem</DialogTitle>
          <DialogDescription>
            Envie uma imagem para montar a galeria publica da sua lista.
          </DialogDescription>
        </DialogHeader>
        <GalleryItemForm
          listId={listId}
          mode="create"
          handleSuccessAction={() => setIsOpen(false)}
          handleCancelAction={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
