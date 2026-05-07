"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useGetList } from "@/hooks/use-get-list";
import { useGetListFeatures } from "@/hooks/use-get-list-features";
import { getVisibleListNavFeatures } from "@/components/app/(dashboard)/lists/[listId]/list-nav-features";
import { ListMobileNav } from "@/components/app/(dashboard)/lists/[listId]/list-mobile-nav";

interface ListHeaderProps {
  listId: number;
  pathname: string;
}

export function ListHeader({ listId, pathname }: ListHeaderProps) {
  const router = useRouter();
  const { data: list, isLoading, isPending } = useGetList({ listId });
  const listFeatures = useGetListFeatures({ listId: String(listId) });

  const visibleFeatures = useMemo(() => {
    return getVisibleListNavFeatures(listFeatures.data);
  }, [listFeatures.data]);
  const shareEnabled = listFeatures.data?.share_enabled ?? true;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-start justify-between gap-2">
        {isLoading || isPending ? (
          <Skeleton className="h-8 w-48 bg-gray-200" />
        ) : (
          <h1 className="text-lg font-bold md:text-2xl">{list?.title}</h1>
        )}
        {shareEnabled && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-2"
            onClick={() => router.push(`/share/${list?.share_id || listId}`)}
          >
            <ExternalLink className="size-4" />
            <span className="hidden sm:inline">Visitar lista</span>
          </Button>
        )}
      </div>
      <ListMobileNav listId={listId} pathname={pathname} features={visibleFeatures} />
      {!isLoading && !isPending && !list?.active && (
        <p className="text-muted-foreground text-sm">
          Esta lista esta pausada no momento. Para que seus convidados possam acessa-la, va ate as configuracoes e mude
          o status para publica.
        </p>
      )}
    </div>
  );
}
