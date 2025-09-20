"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Banknote, Gift, Image, Link as LinkIcon, MessagesSquare, Palette, Settings, Users } from "lucide-react";

const FEATURES = [
  { value: "products", label: "Presentes", icon: Gift },
  { value: "gallery", label: "Galeria", icon: Image },
  { value: "notes", label: "Recados", icon: MessagesSquare },
  { value: "share", label: "Compartilhar", icon: LinkIcon },
  { value: "guests", label: "Convidados", icon: Users },
  { value: "payments", label: "Pagamentos", icon: Banknote },
  { value: "customize", label: "Personalizar", icon: Palette },
  { value: "settings", label: "Configurações", icon: Settings },
];

interface ListSidebarNavProps {
  listId: number;
  pathname: string;
}

export function ListSidebarNav({ listId, pathname }: ListSidebarNavProps) {
  const lastPathSegment = pathname.split("/").pop();

  return (
    <div className='hidden md:flex min-w-[200px] flex-col gap-2'>
      <span className='text-muted-foreground'>Funcionalidades</span>
      <ul className='space-y-1'>
        {FEATURES
          .slice(0, 4)
          .map(feature => (
            <li key={feature.value}>
              <Link
                href={`/lists/${listId}/${feature.value}`}
                className={cn(
                  "rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors",
                  lastPathSegment === feature.value && "bg-gray-100 cursor-default text-[#b1563c]"
                )}
              >
                <feature.icon size={20} />
                {feature.label}
              </Link>
            </li>
          ))}
      </ul>
      <span className='text-muted-foreground'>Gestão</span>
      <ul className='space-y-1'>
        {FEATURES
          .slice(4, 8)
          .map(feature => (
            <li key={feature.value}>
              <Link
                href={`/lists/${listId}/${feature.value}`}
                className={cn(
                  "rounded flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors",
                  lastPathSegment === feature.value && "bg-gray-100 cursor-default text-[#b1563c]"
                )}
              >
                <feature.icon size={20} />
                {feature.label}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}