import { GalleryItem } from "@/services/gallery/gallery-types";

export type GetGalleryItemsRequest = {
  listId: string;
};

export type GetGalleryItemsResponse = GalleryItem[];

export const getGalleryItems = async ({
  listId,
}: GetGalleryItemsRequest): Promise<GetGalleryItemsResponse> => {
  const response = await fetch(`/api/lists/${listId}/gallery`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};

