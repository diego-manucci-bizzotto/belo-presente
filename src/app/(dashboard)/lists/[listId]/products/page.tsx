"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {AddProductDialog} from "@/components/app/lists/[listId]/products/add-product-dialog";
import {ProductsDisplay} from "@/components/app/lists/[listId]/products/products-display";

export default function Page() {
  // TODO: Fetch products for the list and handle loading/error states.
  const products = [1, 2, 3, 4, 5, 6, 7, 8]; // Using mock data for now

  const [filter, setFilter] = useState("");

  // TODO: Implement filtering logic based on actual product data.
  const filteredProducts = products;

  return (
    <div className='w-full flex flex-col gap-4 h-full'>
      <div className='flex justify-between items-center gap-4'>
        <Input
          placeholder='Filtrar produtos...'
          className='w-full md:max-w-sm'
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <AddProductDialog />
      </div>
      <ProductsDisplay products={filteredProducts} />
    </div>
  );
}