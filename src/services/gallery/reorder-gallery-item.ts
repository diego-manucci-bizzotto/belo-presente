import { GalleryItem } from "@/services/gallery/gallery-types";

export type ReorderGalleryItemDirection = "up" | "down";

export type ReorderGalleryItemRequest = {
  list_id: string;
  gallery_item_id: string;
  direction: ReorderGalleryItemDirection;
};

type ReorderGalleryItemResponse = {
  ok: boolean;
  moved: boolean;
  item: GalleryItem;
};

export const reorderGalleryItem = async ({
  list_id,
  gallery_item_id,
  direction,
}: ReorderGalleryItemRequest): Promise<ReorderGalleryItemResponse> => {
  const response = await fetch(`/api/lists/${list_id}/gallery/${gallery_item_id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      direction,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};

