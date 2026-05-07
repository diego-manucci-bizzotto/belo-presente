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
import { useDeleteContribution } from "@/hooks/use-delete-contribution";

interface DeleteContributionAlertProps {
  listId: string;
  contributionId: string;
  contributorName: string;
  trigger?: ReactElement;
}

export function DeleteContributionAlert({
  listId,
  contributionId,
  contributorName,
  trigger,
}: DeleteContributionAlertProps) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteContribution = useDeleteContribution({ listId });

  const handleDelete = async () => {
    await deleteContribution.mutateAsync({
      list_id: listId,
      contribution_id: contributionId,
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
          <AlertDialogTitle>Excluir contribuicao</AlertDialogTitle>
          <AlertDialogDescription>
            Voce tem certeza que deseja excluir a contribuicao de {contributorName}?
            Essa acao nao pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteContribution.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            disabled={deleteContribution.isPending}
          >
            {deleteContribution.isPending && <Loader2Icon className="animate-spin" />}
            Confirmar exclusao
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

