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
import { AddGuestForm } from "@/components/app/(dashboard)/lists/[listId]/guests/add-guest-form";

interface AddGuestDialogProps {
  listId: string;
}

export function AddGuestDialog({ listId }: AddGuestDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#b1563c] text-white hover:bg-[#a0452f]">
          <Plus />
          <span className="hidden md:block">Adicionar convidado</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar convidado</DialogTitle>
          <DialogDescription>
            Preencha os dados para adicionar um convidado na lista.
          </DialogDescription>
        </DialogHeader>
        <AddGuestForm
          listId={listId}
          handleSuccessAction={() => setIsOpen(false)}
          handleCancelAction={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
