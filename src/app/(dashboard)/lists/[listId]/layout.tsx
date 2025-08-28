"use client"

import React, {use} from "react";
import Link from "next/link";
import {Banknote, Gift, Image, Link as LinkIcon, MessagesSquare, Palette, Settings, Users} from "lucide-react";
import {cn} from "@/lib/utils";
import {notFound, usePathname, useRouter} from "next/navigation";
import {useGetList} from "@/services/lists/getList";
import {Skeleton} from "@/components/ui/skeleton";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const FEATURES = [
  {value: "products", label: "Presentes", icon: Gift, category: "features"},
  {value: "gallery", label: "Galeria", icon: Image, category: "features"},
  {value: "notes", label: "Recados", icon: MessagesSquare, category: "features"},
  {value: "share", label: "Compartilhar", icon: LinkIcon, category: "features"},
  {value: "guests", label: "Convidados", icon: Users, category: "management"},
  {value: "payments", label: "Pagamentos", icon: Banknote, category: "management"},
  {value: "customize", label: "Personalizar", icon: Palette, category: "management"},
  {value: "settings", label: "Configurações", icon: Settings, category: "management"},
];

export default function RootLayout({children, params}: Readonly<{
  children: React.ReactNode,
  params: Promise<{ listId: string }>
}>) {
  const pathname = usePathname();
  const router = useRouter();

  const {listId} = use(params);
  const list = useGetList(Number(listId));

  if (!listId) return notFound();

  const lastPathSegment = pathname.split("/").pop();

  return (
    <div className="flex flex-col items-start gap-4 flex-grow p-4 h-full">
      <div className='flex w-full justify-between gap-4'>
        {list.isLoading || list.isPending ? (
          <Skeleton className="h-8 w-42 bg-gray-200"/>
        ) : (
          <h1 className="text-2xl font-bold">{list.data?.title}</h1>
        )}
        <div className="md:hidden">
          <Select
            value={lastPathSegment}
            onValueChange={value => router.push(`/lists/${listId}/${value}`)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma funcionalidade"/>
            </SelectTrigger>
            <SelectContent>
              {FEATURES.map(f => (
                <SelectItem key={f.value} value={f.value}>
                  <f.icon size={16}/>
                  <p>{f.label}</p>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {!list.data?.active && (
        <p className='text-muted-foreground'>
          Esta lista está pausada no momento.
          Para que seus convidados possam acessá-la, vá até as configurações e mude o status para pública.
        </p>
      )}
      <div className='flex flex-col md:flex-row w-full gap-8 h-full overflow-y-auto'>
        <div className='hidden md:flex min-w-[200px] flex-col gap-2'>
          <span className='text-muted-foreground'>Funcionalidades</span>
          <ul className='space-y-1'>
            {FEATURES
              .filter(feature => feature.category === "features")
              .map(feature => (
                <li key={feature.value}>
                  <Link
                    href={`/lists/${listId}/${feature.value}`}
                    className={cn(
                      "rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors",
                      lastPathSegment === feature.value && "bg-gray-100 cursor-default text-[#b1563c]"
                    )}
                  >
                    <feature.icon size={20}/>
                    {feature.label}
                  </Link>
                </li>
              ))}
          </ul>
          <span className='text-muted-foreground'>Gestão</span>
          <ul className='space-y-1'>
            {FEATURES
              .filter(feature => feature.category === "management")
              .map(feature => (
                <li key={feature.value}>
                  <Link
                    href={`/lists/${listId}/${feature.value}`}
                    className={cn(
                      "rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors",
                      lastPathSegment === feature.value && "bg-gray-100 cursor-default text-[#b1563c]"
                    )}
                  >
                    <feature.icon size={20}/>
                    {feature.label}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
        {children}
      </div>
    </div>
  );
}