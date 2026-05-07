import { GalleryItem } from "@/services/gallery/gallery-types";

export type CreateGalleryItemRequest = {
  list_id: string;
  image_url: string;
  caption?: string;
};

export type CreateGalleryItemResponse = GalleryItem;

export const createGalleryItem = async ({
  list_id,
  image_url,
  caption,
}: CreateGalleryItemRequest): Promise<CreateGalleryItemResponse> => {
  const response = await fetch(`/api/lists/${list_id}/gallery`, {
    method: "POST",
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

