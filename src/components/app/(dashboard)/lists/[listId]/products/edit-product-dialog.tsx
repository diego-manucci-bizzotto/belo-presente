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
import { AddProductForm } from "@/components/app/(dashboard)/lists/[listId]/products/add-product-form";
import { CreateProductResponse } from "@/services/products/create-product";

interface EditProductDialogProps {
  listId: string;
  product: CreateProductResponse;
  trigger?: ReactElement;
}

export function EditProductDialog({ listId, product, trigger }: EditProductDialogProps) {
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
          <DialogTitle>Editar produto</DialogTitle>
          <DialogDescription>
            Atualize as informacoes do produto.
          </DialogDescription>
        </DialogHeader>
        <AddProductForm
          listId={listId}
          mode="edit"
          product={product}
          handleSuccessAction={() => setIsOpen(false)}
          handleCancelAction={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
