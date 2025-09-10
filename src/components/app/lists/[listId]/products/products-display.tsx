"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

// TODO: Replace with your actual product type
interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

interface ProductListProps {
  // TODO: Replace with your actual products array
  products: any[];
}

export function ProductsDisplay({ products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-gray-500'>Nenhum produto encontrado.</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 overflow-y-auto h-full'>
      {products.map((product, index) => (
        <Card key={index} className="flex flex-col md:flex-row gap-4 items-start p-4">
          <Image
            src="https://picsum.photos/200" // TODO: Replace with product.imageUrl
            alt={`Produto ${index + 1}`} // TODO: Replace with product.name
            width={100}
            height={100}
            className="rounded object-cover w-full md:w-24 h-auto"
          />
          <CardContent className="p-0 flex flex-col gap-1">
            <h3 className="text-md font-semibold">Nome do Produto</h3> {/* TODO: Replace with product.name */}
            <p className="text-sm text-gray-500">Descrição do produto aqui.</p> {/* TODO: Replace with product.description */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}