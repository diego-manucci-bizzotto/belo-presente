"use client"

import {useMemo, useState} from "react";
import {useGetLists} from "@/hooks/use-get-lists";
import {ListsToolbar} from "@/components/app/lists/lists-toolbar";
import {ListsTitle} from "@/components/app/lists/lists-title";
import {ListsDisplay} from "@/components/app/lists/lists-display";

export default function Page() {

  const [filter, setFilter] = useState("");

  const lists = useGetLists();

  const filteredLists = useMemo(() => {
    if (!lists.data) {
      return [];
    }

    return lists.data.filter(list =>
      list.title.toLowerCase().includes(filter.toLowerCase())
    );
  }, [lists.data, filter]);

  const hasInitialData = (lists.data && lists.data.length > 0) || false;

  const handleFilterChange = (value: string) => {
    setFilter(value);
  }

  return (
    <main className="flex flex-col gap-4 flex-grow p-4 h-full">
      <ListsTitle/>
      <ListsToolbar filter={filter} handleFilterChangeAction={handleFilterChange}/>
      <ListsDisplay isLoading={lists.isLoading || lists.isPending} hasInitialData={hasInitialData} filteredLists={filteredLists}/>
    </main>
  );
}