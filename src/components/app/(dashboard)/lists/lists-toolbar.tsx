"use client";

import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {FilterActionsToolbar} from "@/components/app/(dashboard)/filter-actions-toolbar";

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
    <FilterActionsToolbar
      filter={filter}
      placeholder="Filtrar listas..."
      onFilterChangeAction={handleFilterChangeAction}
      action={(
        <Button onClick={navigateToNewList} className="bg-[#b1563c] text-white hover:bg-[#a0452f] sm:w-auto">
          <Plus/>
          Nova lista
        </Button>
      )}
    />
  );
}
