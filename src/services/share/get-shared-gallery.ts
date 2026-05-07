import { GalleryItem } from "@/services/gallery/gallery-types";

export type GetSharedGalleryRequest = {
  shareId: string;
};

export type GetSharedGalleryResponse = GalleryItem[];

export const getSharedGallery = async ({
  shareId,
}: GetSharedGalleryRequest): Promise<GetSharedGalleryResponse> => {
  const response = await fetch(`/api/share/${shareId}/gallery`, {
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

