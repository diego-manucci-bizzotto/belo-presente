"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AddGalleryItemDialog } from "@/components/app/(dashboard)/lists/[listId]/gallery/add-gallery-item-dialog";
import { GalleryItemsDisplay } from "@/components/app/(dashboard)/lists/[listId]/gallery/gallery-items-display";
import { FilterActionsToolbar } from "@/components/app/(dashboard)/filter-actions-toolbar";
import { useGetGalleryItems } from "@/hooks/use-get-gallery-items";

export default function Page() {
  const [filter, setFilter] = useState("");
  const params = useParams<{ listId: string }>();
  const listId = params.listId;
  const galleryItems = useGetGalleryItems({ listId });

  const filteredItems = useMemo(() => {
    if (!galleryItems.data) {
      return [];
    }

    const normalizedFilter = filter.trim().toLowerCase();
    if (!normalizedFilter) {
      return galleryItems.data;
    }

    return galleryItems.data.filter((item) => {
      const byCaption = item.caption.toLowerCase().includes(normalizedFilter);
      const byUrl = item.image_url.toLowerCase().includes(normalizedFilter);
      return byCaption || byUrl;
    });
  }, [filter, galleryItems.data]);

  return (
    <div className="w-full flex flex-col gap-4">
      <FilterActionsToolbar
        filter={filter}
        placeholder="Filtrar imagens..."
        onFilterChangeAction={setFilter}
        action={<AddGalleryItemDialog listId={listId} />}
      />

      <GalleryItemsDisplay
        listId={listId}
        items={filteredItems}
        isLoading={galleryItems.isLoading || galleryItems.isPending}
      />
    </div>
  );
}
