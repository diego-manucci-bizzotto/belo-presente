"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { GetProductsResponse } from "@/services/products/get-products";
import { DeleteProductAlert } from "@/components/app/(dashboard)/lists/[listId]/products/delete-product-alert";
import { EditProductDialog } from "@/components/app/(dashboard)/lists/[listId]/products/edit-product-dialog";

interface ProductListProps {
  listId: string;
  products: GetProductsResponse;
  isLoading: boolean;
}

const MODE_LABELS = {
  qrcode: "QR code",
  redirect: "Loja externa",
  free: "Legado",
} as const;

const formatPrice = (price: number | null, currency: string) => {
  if (price === null) {
    return "Sem valor definido";
  }

  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
};

const getModeLabel = (mode: string) => {
  if (mode in MODE_LABELS) {
    return MODE_LABELS[mode as keyof typeof MODE_LABELS];
  }

  return mode;
};

export function ProductsDisplay({ listId, products, isLoading }: ProductListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 overflow-y-auto h-full">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-md bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Nenhum produto encontrado.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto h-full">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col md:flex-row gap-4 items-start p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url || "https://picsum.photos/200"}
            alt={product.name}
            className="rounded object-cover w-full md:w-24 h-24"
          />
          <CardContent className="p-0 flex flex-col gap-2 w-full">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-md font-semibold">{product.name}</h3>
                <Badge variant="secondary">{getModeLabel(product.purchase_type)}</Badge>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <EllipsisVertical />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-42" align="end">
                  <div>
                    <EditProductDialog
                      listId={listId}
                      product={product}
                      trigger={(
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors"
                        >
                          <Pencil size={20} />
                          Editar produto
                        </button>
                      )}
                    />
                    <Separator />
                    <DeleteProductAlert
                      listId={listId}
                      productId={product.id}
                      productName={product.name}
                      trigger={(
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 text-red-400 hover:bg-red-100 p-2 transition-colors"
                        >
                          <Trash2 size={20} />
                          Excluir produto
                        </button>
                      )}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-sm text-gray-500">{product.description || "Sem descricao"}</p>
            <p className="text-sm text-muted-foreground">
              {formatPrice(product.price, product.currency)} • Quantidade: {product.quantity}
            </p>
            {product.url && (
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline"
              >
                Ver produto
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
