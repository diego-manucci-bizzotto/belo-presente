"use client";

import {useRouter} from "next/navigation";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";

interface ListsHeaderProps {
  filter: string;
  handleFilterChangeAction: (value: string) => void;
}

export function ListsToolbar({filter, handleFilterChangeAction}: ListsHeaderProps) {
  const router = useRouter();

  const navigateToNewList = () => {
    router.push('/lists/new');
  };

  return (
    <div className='flex justify-between gap-4 items-center'>
      <Input
        value={filter}
        onChange={(e) => handleFilterChangeAction(e.target.value)}
        type='text'
        placeholder='Filtrar listas...'
        className='w-full md:max-w-sm'
      />
      <Button onClick={navigateToNewList} className="bg-[#b1563c] text-white hover:bg-[#a0452f]">
        <Plus/>
        Nova lista
      </Button>
    </div>
  );
}