"use client";

import {Skeleton} from "@/components/ui/skeleton";
import ListCard from "@/components/app/lists/list-card";
import Image from "next/image";
import {GetListsResponse} from "@/services/lists/get-lists";

interface ListsDisplayProps {
  isLoading: boolean;
  hasInitialData: boolean;
  filteredLists: GetListsResponse;
}

export function ListsDisplay({ isLoading, hasInitialData, filteredLists }: ListsDisplayProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-min gap-4 h-full overflow-y-auto">
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} className="col-span-1 h-[144.5px] w-full rounded-md bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!hasInitialData) {
    return (
      <div className="col-span-3 text-center p-4 flex justify-center items-center flex-col gap-8 h-full">
        <div className='flex flex-col'>
          <h3 className="text-lg font-semibold">Ainda não há nada por aqui!</h3>
          <p className="text-muted-foreground">Clique no botão &#34;Nova lista&#34; para começar a criar sua primeira lista de presentes!</p>
        </div>
        <Image src="/gift-box.svg" alt="gift-box" width={1024} height={1024} className="w-[400px] h-auto" />
      </div>
    );
  }

  if (filteredLists.length === 0) {
    return (
      <div className="col-span-3 text-center p-4 flex justify-center items-center flex-col gap-8 h-full">
        <div className='flex flex-col'>
          <h3 className="text-lg font-semibold">Nenhuma lista encontrada!</h3>
          <p className="text-muted-foreground">
            Tente ajustar o filtro ou crie uma nova lista de presentes clicando no botão &#34;Nova lista&#34;.
          </p>
        </div>
        <Image src="/gift-box.svg" alt="gift-box" width={1024} height={1024} className="w-[400px] h-auto" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-min gap-4 h-full overflow-y-auto">
      {filteredLists.map(list => (
        <ListCard list={list} key={list.id} />
      ))}
    </div>
  );
}