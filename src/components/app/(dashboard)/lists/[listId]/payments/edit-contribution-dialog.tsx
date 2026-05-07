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
import { Contribution } from "@/services/contributions/contribution-types";
import { ContributionForm } from "@/components/app/(dashboard)/lists/[listId]/payments/contribution-form";

interface EditContributionDialogProps {
  listId: string;
  contribution: Contribution;
  trigger?: ReactElement;
}

export function EditContributionDialog({
  listId,
  contribution,
  trigger,
}: EditContributionDialogProps) {
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
          <DialogTitle>Editar contribuicao</DialogTitle>
          <DialogDescription>
            Atualize os dados da contribuicao.
          </DialogDescription>
        </DialogHeader>
        <ContributionForm
          listId={listId}
          mode="edit"
          contribution={contribution}
          handleSuccessAction={() => setIsOpen(false)}
          handleCancelAction={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

