"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GetProductsResponse } from "@/services/products/get-products";

interface ProductListProps {
  products: GetProductsResponse;
  isLoading: boolean;
}

const MODE_LABELS = {
  payment: "Dinheiro",
  redirect: "Loja externa",
  free: "Livre",
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

export function ProductsDisplay({ products, isLoading }: ProductListProps) {
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
          <CardContent className="p-0 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-md font-semibold">{product.name}</h3>
              <Badge variant="secondary">{MODE_LABELS[product.purchase_type]}</Badge>
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
