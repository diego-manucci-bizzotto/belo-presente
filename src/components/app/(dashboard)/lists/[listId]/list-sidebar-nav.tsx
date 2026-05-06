"use client";

import { useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useGetListFeatures } from "@/hooks/use-get-list-features";
import { getVisibleListNavFeatures } from "@/components/app/(dashboard)/lists/[listId]/list-nav-features";

interface ListSidebarNavProps {
  listId: number;
  pathname: string;
}

export function ListSidebarNav({ listId, pathname }: ListSidebarNavProps) {
  const lastPathSegment = pathname.split("/").pop();
  const listFeatures = useGetListFeatures({ listId: String(listId) });

  const visibleFeatures = useMemo(() => {
    return getVisibleListNavFeatures(listFeatures.data);
  }, [listFeatures.data]);

  const functionalities = visibleFeatures.filter((feature) => feature.section === "functionalities");
  const management = visibleFeatures.filter((feature) => feature.section === "management");

  return (
    <div className="hidden md:flex min-w-[200px] flex-col gap-2">
      <span className="text-muted-foreground">Funcionalidades</span>
      <ul className="space-y-1">
        {functionalities.map((feature) => (
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
      <span className="text-muted-foreground">Gestao</span>
      <ul className="space-y-1">
        {management.map((feature) => (
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
