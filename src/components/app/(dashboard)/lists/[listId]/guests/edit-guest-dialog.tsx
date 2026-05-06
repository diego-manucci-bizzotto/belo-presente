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
import { AddGuestForm } from "@/components/app/(dashboard)/lists/[listId]/guests/add-guest-form";
import { CreateGuestResponse } from "@/services/guests/create-guest";

interface EditGuestDialogProps {
  listId: string;
  guest: CreateGuestResponse;
  trigger?: ReactElement;
}

export function EditGuestDialog({ listId, guest, trigger }: EditGuestDialogProps) {
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
          <DialogTitle>Editar convidado</DialogTitle>
          <DialogDescription>
            Atualize as informacoes do convidado.
          </DialogDescription>
        </DialogHeader>
        <AddGuestForm
          listId={listId}
          mode="edit"
          guest={guest}
          handleSuccessAction={() => setIsOpen(false)}
          handleCancelAction={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
