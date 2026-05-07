"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ListNavFeature } from "@/components/app/(dashboard)/lists/[listId]/list-nav-features";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ListMobileNavProps {
  listId: number;
  pathname: string;
  features: ListNavFeature[];
}

export function ListMobileNav({ listId, pathname, features }: ListMobileNavProps) {
  const router = useRouter();
  const lastPathSegment = pathname.split("/").pop();
  const selectedFeature = useMemo(() => {
    return features.find((feature) => feature.value === lastPathSegment);
  }, [features, lastPathSegment]);

  return (
    <div className="md:hidden">
      <Select
        value={selectedFeature?.value}
        onValueChange={(value) => router.push(`/lists/${listId}/${value}`)}
      >
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder="Navegar na lista" />
        </SelectTrigger>
        <SelectContent>
          {features.map((feature) => (
            <SelectItem key={feature.value} value={feature.value}>
              <span className="inline-flex items-center gap-2">
                <feature.icon className="size-4" />
                {feature.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
