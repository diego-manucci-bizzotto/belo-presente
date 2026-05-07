import { GalleryItem } from "@/services/gallery/gallery-types";

export type UpdateGalleryItemRequest = {
  list_id: string;
  gallery_item_id: string;
  image_url: string;
  caption?: string;
};

export type UpdateGalleryItemResponse = GalleryItem;

export const updateGalleryItem = async ({
  list_id,
  gallery_item_id,
  image_url,
  caption,
}: UpdateGalleryItemRequest): Promise<UpdateGalleryItemResponse> => {
  const response = await fetch(`/api/lists/${list_id}/gallery/${gallery_item_id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url,
      caption,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};

