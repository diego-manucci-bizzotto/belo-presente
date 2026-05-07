"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GalleryItem } from "@/services/gallery/gallery-types";
import { GalleryItemForm } from "@/components/app/(dashboard)/lists/[listId]/gallery/gallery-item-form";

interface EditGalleryItemDialogProps {
  listId: string;
  galleryItem: GalleryItem;
  trigger?: ReactElement;
}

export function EditGalleryItemDialog({
  listId,
  galleryItem,
  trigger,
}: EditGalleryItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Pencil />
            Editar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar imagem</DialogTitle>
          <DialogDescription>
            Atualize a imagem e a legenda.
          </DialogDescription>
        </DialogHeader>
        <GalleryItemForm
          listId={listId}
          mode="edit"
          galleryItem={galleryItem}
          handleSuccessAction={() => setIsOpen(false)}
          handleCancelAction={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
