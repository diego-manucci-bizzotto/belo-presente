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
import { useDeleteGuest } from "@/hooks/use-delete-guest";

interface DeleteGuestAlertProps {
  listId: string;
  guestId: string;
  guestName: string;
  trigger?: ReactElement;
}

export function DeleteGuestAlert({
  listId,
  guestId,
  guestName,
  trigger,
}: DeleteGuestAlertProps) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteGuest = useDeleteGuest({ listId });

  const handleDelete = async () => {
    await deleteGuest.mutateAsync({
      list_id: listId,
      guest_id: guestId,
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
          <AlertDialogTitle>Excluir convidado</AlertDialogTitle>
          <AlertDialogDescription>
            Voce tem certeza que deseja excluir {guestName}?
            Essa acao nao pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteGuest.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            disabled={deleteGuest.isPending}
          >
            {deleteGuest.isPending && <Loader2Icon className="animate-spin" />}
            Confirmar exclusao
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
