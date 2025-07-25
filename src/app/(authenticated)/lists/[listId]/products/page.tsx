"use client"

import {use} from "react";
import {useGetList} from "@/services/lists/getList";
import {notFound} from "next/navigation";

export default function List({params}: { params: Promise<{ listId: string }> }) {
  const {listId} = use(params);

  const list = useGetList(listId);

  if (!listId) return notFound();

  return (
    <div className='w-full flex flex-col gap-4'>
      {list.data?.title}
    </div>
  );
}