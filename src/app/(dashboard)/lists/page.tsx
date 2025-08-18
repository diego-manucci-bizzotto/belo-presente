"use client"

import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {useRouter} from "next/navigation";
import {useGetLists} from "@/services/lists/getLists";
import {useSession} from "next-auth/react";
import Image from "next/image";
import {Skeleton} from "@/components/ui/skeleton";
import List from "@/components/app/lists/list";

export default function Lists() {
  const { data: session } = useSession();

  const router = useRouter();

  const lists = useGetLists(session?.user.id);

  const navigateToNewList = () => {
    router.push('/lists/new');
  }

  return (
    <main className="flex flex-col gap-4 flex-grow p-4 h-full">
      <div className='flex justify-between items-end'>
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">Bem-vindo(a){session?.user.name ? ", " + session.user.name : "!"} 😁</h2>
          <p className='text-muted-foreground'>
            Aqui você pode gerenciar e acompanhar suas listas de presentes
          </p>
        </div>
        <Button onClick={navigateToNewList} className="bg-[#b1563c] text-white hover:bg-[#a0452f]">
          <Plus/>
          Nova lista
        </Button>
      </div>
      <div className="grid grid-cols-3 auto-rows-min gap-4 h-full overflow-y-auto">
        {(lists.isPending || lists.isLoading) && (
          [1, 2, 3, 4, 5, 6].map((_, index) => (
            <Skeleton key={index} className="col-span-1 h-[144.5px] w-full rounded-md bg-gray-200 animate-pulse" />
          ))
        )}
        {lists.data?.length === 0 && (
          <div className="col-span-3 text-center p-4 flex justify-center items-center flex-col gap-8">
            <div className='flex flex-col'>
              <h3 className="text-lg font-semibold">Ainda não há nada por aqui!</h3>
              <p className="text-muted-foreground">Clique no botão &#34;Nova lista&#34; para começar a criar sua primeira lista de presentes!</p>
            </div>
            <Image src="/gift-box.svg" alt="gift-box" width={1024} height={1024} className="w-[400px] h-auto"/>
          </div>
        )}
        {lists.data && lists.data.map(list => (
          <List list={list} key={list.id} />
        ))}
      </div>
    </main>
  );
}