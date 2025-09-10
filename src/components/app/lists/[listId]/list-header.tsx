"use client";

import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Banknote, Gift, Image, Link as LinkIcon, MessagesSquare, Palette, Settings, Users } from "lucide-react";
import { useGetList } from "@/hooks/use-get-list";
import {cn} from "@/lib/utils";

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

interface ListHeaderProps {
  listId: number;
  pathname: string;
}

export function ListHeader({ listId, pathname }: ListHeaderProps) {
  const router = useRouter();
  const { data: list, isLoading, isPending } = useGetList({listId});
  const lastPathSegment = pathname.split("/").pop();

  const handleNavigate = (value: string) => {
    router.push(`/lists/${listId}/${value}`);
  }

  return (
    <div className='flex w-full justify-between gap-4 items-start flex-col'>
      <div className="flex w-full justify-between items-center gap-4">
        {isLoading || isPending ? (
          <Skeleton className="h-8 w-48 bg-gray-200" />
        ) : (
          <h1 className="text-2xl font-bold">{list?.title}</h1>
        )}
        <Select value={lastPathSegment} onValueChange={handleNavigate}>
          <SelectTrigger className="w-full w-auto hover:cursor-pointer text-primary md:hidden">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Funcionalidades</SelectLabel>
              {FEATURES.slice(0, 4).map(feature => (
                <SelectItem key={feature.value} value={feature.value} className={cn('hover:cursor-pointer text-muted-foreground hover:text-black', feature.value.includes(lastPathSegment || "") && "text-primary! hover:text-primary! hover:cursor-default bg-white! hover:bg-white!")}>
                <feature.icon className={cn("inline-block mr-2 h-4 w-4 hover:text-black", feature.value.includes(lastPathSegment || "") && "text-primary")} />
                  {feature.label}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Gestão</SelectLabel>
              {FEATURES.slice(4, 8).map(feature => (
                <SelectItem key={feature.value} value={feature.value} className={cn('hover:cursor-pointer text-muted-foreground hover:text-black', feature.value.includes(lastPathSegment || "") && "text-primary")}>
                  <feature.icon className={cn("inline-block mr-2 h-4 w-4 hover:text-black", feature.value.includes(lastPathSegment || "") && "text-primary")}/>
                  {feature.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {!isLoading && !isPending && !list?.active && (
        <p className='text-muted-foreground text-sm'>
          Esta lista está pausada no momento.
          Para que seus convidados possam acessá-la, vá até as configurações e mude o status para pública.
        </p>
      )}
    </div>
  );
}