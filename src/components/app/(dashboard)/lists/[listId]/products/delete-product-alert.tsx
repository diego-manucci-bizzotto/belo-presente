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
import { useDeleteProduct } from "@/hooks/use-delete-product";

interface DeleteProductAlertProps {
  listId: string;
  productId: string;
  productName: string;
  trigger?: ReactElement;
}

export function DeleteProductAlert({
  listId,
  productId,
  productName,
  trigger,
}: DeleteProductAlertProps) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteProduct = useDeleteProduct({ listId });

  const handleDelete = async () => {
    await deleteProduct.mutateAsync({
      list_id: listId,
      product_id: productId,
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
          <AlertDialogTitle>Excluir produto</AlertDialogTitle>
          <AlertDialogDescription>
            Voce tem certeza que deseja excluir o produto {productName}?
            Essa acao nao pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteProduct.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            disabled={deleteProduct.isPending}
          >
            {deleteProduct.isPending && <Loader2Icon className="animate-spin" />}
            Confirmar exclusao
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
