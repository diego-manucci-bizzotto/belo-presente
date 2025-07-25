"use client"

import {Button} from "@/components/ui/button";
import {EllipsisVertical, ExternalLink, Pen, Plus, SquarePen, Trash} from "lucide-react";
import {useAuth} from "@/hooks/use-auth";
import {useRouter} from "next/navigation";
import {useGetLists} from "@/services/lists/getLists";
import {useEffect} from "react";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";
import Link from "next/link";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";

export default function Lists() {
  const {user} = useAuth();

  const router = useRouter();

  const lists = useGetLists(user?.uid || "");

  const navigateToNewList = () => {
    router.push('/lists/new');
  }

  const getEmojiByCategory = (category: string): string => {
    const map: Record<string, string> = {
      "Chá de Casa Nova": "🏠",
      "Chá de Bebê": "🍼",
      "Chá Revelação": "💙🩷",
      "Chá de Fraldas": "🩲",
      "Chá de Lingerie": "👙",
      "Chá de Panela": "🧑‍🍳",
      "Chá de Cozinha": "🍴",
      "Casamento": "💐",
      "Noivado": "💍",
      "Quinze Anos": "👧",
      "Aniversário": "🎂",
      "Bodas": "💎",
      "Festinha do Pet": "🐶",
      "Festa Infantil": "👠",
      "Formatura": "🎓",
      "Dia dos Namorados": "💞",
      "Natal": "🎅",
      "Compras": "🛒",
      "Outro": "❓",
    };

    return map[category] || "❔";
  };

  return (
    <main className="flex flex-col gap-4 flex-grow p-4">
      <div>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Bem-vindo(a){user?.displayName ? ", " + user?.displayName : "!"} 😁</h2>
          <Button onClick={navigateToNewList} className="bg-[#b1563c] text-white hover:bg-[#a0452f]">
            <Plus/>
            Nova lista
          </Button>
        </div>
        <p className='text-muted-foreground'>
          Aqui você pode gerenciar e acompanhar suas listas de presentes
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
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
                <Button variant="outline" className="absolute top-4 right-4 w-8 h-8">
                  <EllipsisVertical />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <div className="">
                  <Link href={`/lists/${list.id}/edit`} className="flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors">
                    <Pen size={20}/>
                    Editar lista
                  </Link>
                  <Link href={`/lists/${list.id}/edit`} className="flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors">
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