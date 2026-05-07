"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { Loader2Icon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteGalleryItem } from "@/hooks/use-delete-gallery-item";

interface DeleteGalleryItemAlertProps {
  listId: string;
  galleryItemId: string;
  trigger?: ReactElement;
}

export function DeleteGalleryItemAlert({
  listId,
  galleryItemId,
  trigger,
}: DeleteGalleryItemAlertProps) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteGalleryItem = useDeleteGalleryItem({ listId });

  const handleDelete = async () => {
    await deleteGalleryItem.mutateAsync({
      list_id: listId,
      gallery_item_id: galleryItemId,
    });

    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="destructive" size="sm">
            <Trash2 />
            Excluir
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir imagem</AlertDialogTitle>
          <AlertDialogDescription>
            Voce tem certeza que deseja excluir esta imagem da galeria?
            Essa acao nao pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteGalleryItem.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            disabled={deleteGalleryItem.isPending}
          >
            {deleteGalleryItem.isPending && <Loader2Icon className="animate-spin" />}
            Confirmar exclusao
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

