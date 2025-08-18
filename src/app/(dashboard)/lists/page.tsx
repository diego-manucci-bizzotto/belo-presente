"use client"

import {Button} from "@/components/ui/button";
import {EllipsisVertical, ExternalLink, Pen, Plus, Trash} from "lucide-react";
import {useRouter} from "next/navigation";
import {useGetLists} from "@/services/lists/getLists";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";
import Link from "next/link";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Separator} from "@/components/ui/separator";
import {getEmojiByCategory} from "@/utils/utils";

export default function Lists() {
  const user = {}

  const router = useRouter();

  const lists = useGetLists(user?.uid || "");

  const navigateToNewList = () => {
    router.push('/lists/new');
  }

  return (
    <main className="flex flex-col gap-4 flex-grow p-4 h-full">
      <div className='flex justify-between items-end'>
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">Bem-vindo(a){user?.displayName ? ", " + user?.displayName : "!"} 😁</h2>
          <p className='text-muted-foreground'>
            Aqui você pode gerenciar e acompanhar suas listas de presentes
          </p>
        </div>
        <Button onClick={navigateToNewList} className="bg-[#b1563c] text-white hover:bg-[#a0452f]">
          <Plus/>
          Nova lista
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-4 h-full">
        {lists.data?.length === 0 && (
          <div className="col-span-3 text-center p-4 flex justify-center items-center flex-col gap-8">
            <div className='flex flex-col'>
              <h3 className="text-lg font-semibold">Ainda não há nada por aqui!</h3>
              <p className="text-muted-foreground">Clique no botão "Nova lista" para começar a criar sua primeira lista de presentes!</p>
            </div>
            <Image src="/images/gift-box.svg" alt="gift-box" width={1024} height={1024} className="w-[400px] h-auto"/>
          </div>
        )}
        {lists.data && lists.data.map(list => (
          <div key={list.id} className="h-26 cursor-pointer relative flex bg-white p-4 pl-6 rounded-lg border after:content-[''] after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-[#b1563c] after:rounded-l">
            <div className='flex flex-col gap-1'>
              <h3 className="text-md text-gray-800 font-w">{getEmojiByCategory(list.category)} {list.title}</h3>
            </div>
            <Badge variant='secondary' className={cn("absolute bottom-4 left-6")}>
              {list.active ? "Ativa" : "Pausada"}
            </Badge>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size='icon' className="absolute top-4 right-4">
                  <EllipsisVertical />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <div className="">
                  <Link href={`/lists/${list.id}/products`} className="flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors">
                    <Pen size={20}/>
                    Editar lista
                  </Link>
                  <Link href={`/share/${list.id}/`} className="flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors">
                    <ExternalLink size={20}/>
                    Visitar lista
                  </Link>
                  <Separator/>
                  <Button variant="link" onClick={() => {}} className="w-full h-10 flex items-center justify-start gap-2 text-red-400 hover:bg-red-100 p-2 transition-colors text-md font-normal rounded-none hover:no-underline">
                    <Trash size={20}/>
                    Excluir lista
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ))}
      </div>
    </main>
  );
}