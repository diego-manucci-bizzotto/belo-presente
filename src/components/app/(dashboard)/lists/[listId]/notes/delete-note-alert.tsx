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
import { useDeleteNote } from "@/hooks/use-delete-note";

interface DeleteNoteAlertProps {
  listId: string;
  noteId: string;
  authorName: string;
  trigger?: ReactElement;
}

export function DeleteNoteAlert({
  listId,
  noteId,
  authorName,
  trigger,
}: DeleteNoteAlertProps) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteNote = useDeleteNote({ listId });

  const handleDelete = async () => {
    await deleteNote.mutateAsync({
      list_id: listId,
      note_id: noteId,
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
          <AlertDialogTitle>Excluir recado</AlertDialogTitle>
          <AlertDialogDescription>
            Voce tem certeza que deseja excluir o recado de {authorName}?
            Essa acao nao pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteNote.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            disabled={deleteNote.isPending}
          >
            {deleteNote.isPending && <Loader2Icon className="animate-spin" />}
            Confirmar exclusao
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
