"use client"

import React, {use} from "react";
import Link from "next/link";
import {Banknote, Gift, Image, Link as LinkIcon, MessagesSquare, Palette, Settings, Users} from "lucide-react";
import {cn} from "@/lib/utils";
import {notFound, usePathname} from "next/navigation";
import {useGetList} from "@/services/lists/getList";

export default function RootLayout({children, params}: Readonly<{ children: React.ReactNode, params: Promise<{ listId: string }> }>) {
  const pathname = usePathname();

  const {listId} = use(params);

  const list = useGetList(listId);

  if (!listId) return notFound();

  const lastPathSegment = pathname.split("/").pop();

  return (
    <div className="flex flex-col items-start gap-4 flex-grow p-4 h-full">
      <div className='w-full'>
        <h1 className="text-2xl font-bold">{list.data?.title}</h1>
        <p className='text-muted-foreground'>
          Esta lista está pausada no momento.
          Para que seus convidados possam acessá-la, vá até as configurações e mude o status para pública.
        </p>
      </div>
      <div className='w-full flex p-4 gap-8 h-full overflow-y-auto'>
        <div className='min-w-[200px] flex flex-col gap-2'>
          <span className='text-muted-foreground'>Funcionalidades</span>
          <ul>
            <li>
              <Link href={`/lists/${listId}/products`}
                    className={cn("rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors", lastPathSegment == "products" && "bg-gray-100 cursor-default text-[#b1563c]")}>
                <Gift size={20}/>
                Presentes
              </Link>
            </li>
            <li>
              <Link href={`/lists/${listId}/gallery`}
                    className={cn("rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors", lastPathSegment == "gallery" && "bg-gray-100 cursor-default text-[#b1563c]")}>
                <Image size={20}/>
                Galeria
              </Link>
            </li>
            <li>
              <Link href={`/lists/${listId}/notes`}
                    className={cn("rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors", lastPathSegment == "notes" && "bg-gray-100 cursor-default text-[#b1563c]")}>
                <MessagesSquare size={20}/>
                Recados
              </Link>
            </li>
            <li>
              <Link href={`/lists/${listId}/share`}
                    className={cn("rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors", lastPathSegment == "share" && "bg-gray-100 cursor-default text-[#b1563c]")}>
                <LinkIcon size={20}/>
                Compartilhar
              </Link>
            </li>
          </ul>
          <span className='text-muted-foreground'>Gestão</span>
          <ul>
            <li>
              <Link href={`/lists/${listId}/guests`}
                    className={cn("rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors", lastPathSegment == "guests" && "bg-gray-100 cursor-default text-[#b1563c]")}>
                <Users size={20}/>
                Convidados
              </Link>
            </li>
            <li>
              <Link href={`/lists/${listId}/payments`}
                    className={cn("rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors", lastPathSegment == "payments" && "bg-gray-100 cursor-default text-[#b1563c]")}>
                <Banknote size={20}/>
                Pagamentos
              </Link>
            </li>
            <li>
              <Link href={`/lists/${listId}/customize`}
                    className={cn("rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors", lastPathSegment == "customize" && "bg-gray-100 cursor-default text-[#b1563c]")}>
                <Palette size={20}/>
                Personalizar
              </Link>
            </li>
            <li>
              <Link href={`/lists/${listId}/settings`}
                    className={cn("rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors", lastPathSegment == "settings" && "bg-gray-100 cursor-default text-[#b1563c]")}>
                <Settings size={20}/>
                Configurações
              </Link>
            </li>
          </ul>
        </div>
        {children}
      </div>
    </div>
  );
}