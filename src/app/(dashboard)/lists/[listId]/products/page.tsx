"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { AddProductDialog } from "@/components/app/(dashboard)/lists/[listId]/products/add-product-dialog";
import { ProductsDisplay } from "@/components/app/(dashboard)/lists/[listId]/products/products-display";
import { useGetProducts } from "@/hooks/use-get-products";

export default function Page() {
  const [filter, setFilter] = useState("");
  const params = useParams<{ listId: string }>();
  const listId = params.listId;
  const products = useGetProducts({ listId });

  const filteredProducts = useMemo(() => {
    if (!products.data) {
      return [];
    }

    const normalizedFilter = filter.trim().toLowerCase();
    if (!normalizedFilter) {
      return products.data;
    }

    return products.data.filter(product =>
      product.name.toLowerCase().includes(normalizedFilter)
    );
  }, [filter, products.data]);

  return (
    <div className='w-full flex flex-col gap-4 h-full'>
      <div className='flex justify-between items-center gap-4'>
        <Input
          placeholder='Filtrar produtos...'
          className='w-full md:max-w-sm'
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <AddProductDialog listId={listId} />
      </div>
      <ProductsDisplay
        listId={listId}
        products={filteredProducts}
        isLoading={products.isLoading || products.isPending}
      />
    </div>
  );
}
