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
    <main className="flex flex-col items-start gap-4 flex-grow p-4 justify-center items-center">
      <div className='w-full'>
        <h1 className="text-2xl font-bold">{list.data?.title}</h1>
        <p className='text-muted-foreground'>
          Esta lista está pausada no momento.
          Para que seus convidados possam acessá-la, vá até as configurações e mude o status para pública.
        </p>
      </div>
      <div className='w-full flex p-4 gap-8'>
        <div className='min-w-[200px] flex flex-col gap-2'>
          <span className='text-muted-foreground'>Funcionalidades</span>
          <ul>
            <li>
              <Link href={`/lists/${listId}/products`}
                    className=" rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors">
                <Gift size={20}/>
                Presentes
              </Link>
            </li>
            <li>
              <Link href={`/lists/${listId}/gallery`}
                    className={cn("rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors", lastPathSegment == "gallery" && "bg-gray-100")}>
                <Image size={20}/>
                Galeria
              </Link>
            </li>
            <li>
              <Link href={`/lists/${listId}/notes`}
                    className=" rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors">
                <MessagesSquare size={20}/>
                Recados
              </Link>
            </li>
            <li>
              <Link href={`/lists/${listId}/share`}
                    className=" rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors">
                <LinkIcon size={20}/>
                Compartilhar
              </Link>
            </li>
          </ul>
          <span className='text-muted-foreground'>Gestão</span>
          <ul>
            <li>
              <Link href={`/lists/${listId}/guests`}
                    className=" rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors">
                <Users size={20}/>
                Convidados
              </Link>
            </li>
            <li>
              <Link href={`/lists/${listId}/payments`}
                    className=" rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors">
                <Banknote size={20}/>
                Pagamentos
              </Link>
            </li>
            <li>
              <Link href={`/lists/${listId}/customize`}
                    className=" rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors">
                <Palette size={20}/>
                Personalizar
              </Link>
            </li>
            <li>
              <Link href={`/lists/${listId}/settings`}
                    className=" rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors">
                <Settings size={20}/>
                Configurações
              </Link>
            </li>
          </ul>
        </div>
        {children}
      </div>
    </main>
  );
}