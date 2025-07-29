"use client"

import {use} from "react";
import {useGetList} from "@/services/lists/getList";
import {notFound} from "next/navigation";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import Image from "next/image";
import {Card, CardContent} from "@/components/ui/card";

export default function List({params}: { params: Promise<{ listId: string }> }) {
  const {listId} = use(params);

  const list = useGetList(listId);

  const products = [1, 2, 3, 4, 5, 6, 7, 8];

  if (!listId) return notFound();

  return (
    <>
      <div className='w-full flex flex-col gap-4'>
        <div className='flex justify-between items-center'>
          <Input
            placeholder='Filtrar produtos...'
            className='w-full max-w-sm'
          />
          <Button onClick={() => {}} className="bg-[#b1563c] text-white hover:bg-[#a0452f]">
            <Plus/>
            Adicionar produto
          </Button>
        </div>
        {products.length > 0 ? (
          <div className='flex flex-col gap-4 overflow-y-auto h-full'>
            {products.map((product, index) => (
              <Card key={index} className="flex flex-row gap-4 items-start p-4">
                <Image
                  src="https://picsum.photos/200"
                  alt={`Produto ${index + 1}`}
                  width={100}
                  height={100}
                  className="rounded object-cover"
                />
                <CardContent className="p-0 flex flex-col gap-1">
                  <h3 className="text-md font-semibold">kkk</h3>
                  <p className="text-sm text-gray-500">aaaaaaaaaaaaaa</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className='h-full flex items-center justify-center'>
            <p className='text-gray-500'>Nenhum produto encontrado.</p>
          </div>
        )}
      </div>
    </>
  );
}