"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetList } from "@/hooks/use-get-list";
import { useGetListFeatures } from "@/hooks/use-get-list-features";
import { getVisibleListNavFeatures } from "@/components/app/(dashboard)/lists/[listId]/list-nav-features";

interface ListHeaderProps {
  listId: number;
  pathname: string;
}

export function ListHeader({ listId, pathname }: ListHeaderProps) {
  const router = useRouter();
  const { data: list, isLoading, isPending } = useGetList({ listId });
  const listFeatures = useGetListFeatures({ listId: String(listId) });
  const lastPathSegment = pathname.split("/").pop();

  const visibleFeatures = useMemo(() => {
    return getVisibleListNavFeatures(listFeatures.data);
  }, [listFeatures.data]);
  const shareEnabled = listFeatures.data?.share_enabled ?? true;

  const functionalities = visibleFeatures.filter((feature) => feature.section === "functionalities");
  const management = visibleFeatures.filter((feature) => feature.section === "management");
  const selectedFeature = visibleFeatures.some((feature) => feature.value === lastPathSegment)
    ? lastPathSegment
    : undefined;

  const handleNavigate = (value: string) => {
    router.push(`/lists/${listId}/${value}`);
  };

  return (
    <div className="flex w-full justify-between gap-4 items-start flex-col">
      <div className="flex w-full justify-between items-center gap-4">
        {isLoading || isPending ? (
          <Skeleton className="h-8 w-48 bg-gray-200" />
        ) : (
          <h1 className="text-2xl font-bold">{list?.title}</h1>
        )}
        {shareEnabled && (
          <Button variant="outline" onClick={() => router.push(`/share/${list?.share_id || listId}`)}>
            <ExternalLink />
            Visitar lista
          </Button>
        )}
        <Select value={selectedFeature} onValueChange={handleNavigate}>
          <SelectTrigger className="w-full w-auto hover:cursor-pointer text-primary md:hidden">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Funcionalidades</SelectLabel>
              {functionalities.map((feature) => (
                <SelectItem
                  key={feature.value}
                  value={feature.value}
                  className={cn(
                    "hover:cursor-pointer text-muted-foreground hover:text-black",
                    feature.value.includes(lastPathSegment || "") &&
                      "text-primary! hover:text-primary! hover:cursor-default bg-white! hover:bg-white!"
                  )}
                >
                  <feature.icon
                    className={cn(
                      "inline-block mr-2 size-4 hover:text-black",
                      feature.value.includes(lastPathSegment || "") && "text-primary"
                    )}
                  />
                  {feature.label}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Gestao</SelectLabel>
              {management.map((feature) => (
                <SelectItem
                  key={feature.value}
                  value={feature.value}
                  className={cn(
                    "hover:cursor-pointer text-muted-foreground hover:text-black",
                    feature.value.includes(lastPathSegment || "") && "text-primary"
                  )}
                >
                  <feature.icon
                    className={cn(
                      "inline-block mr-2 size-4 hover:text-black",
                      feature.value.includes(lastPathSegment || "") && "text-primary"
                    )}
                  />
                  {feature.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {!isLoading && !isPending && !list?.active && (
        <p className="text-muted-foreground text-sm">
          Esta lista esta pausada no momento. Para que seus convidados possam acessa-la, va ate as configuracoes e mude
          o status para publica.
        </p>
      )}
    </div>
  );
}
