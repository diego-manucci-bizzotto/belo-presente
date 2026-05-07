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
import { ContributionForm } from "@/components/app/(dashboard)/lists/[listId]/payments/contribution-form";

interface AddContributionDialogProps {
  listId: string;
}

export function AddContributionDialog({ listId }: AddContributionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#b1563c] text-white hover:bg-[#a0452f]">
          <Plus />
          Adicionar contribuicao
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar contribuicao</DialogTitle>
          <DialogDescription>
            Registre uma contribuicao para esta lista.
          </DialogDescription>
        </DialogHeader>
        <ContributionForm
          listId={listId}
          mode="create"
          handleSuccessAction={() => setIsOpen(false)}
          handleCancelAction={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
