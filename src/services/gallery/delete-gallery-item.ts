export type DeleteGalleryItemRequest = {
  list_id: string;
  gallery_item_id: string;
};

type DeleteGalleryItemResponse = {
  ok: boolean;
};

export const deleteGalleryItem = async ({
  list_id,
  gallery_item_id,
}: DeleteGalleryItemRequest): Promise<DeleteGalleryItemResponse> => {
  const response = await fetch(`/api/lists/${list_id}/gallery/${gallery_item_id}`, {
    method: "DELETE",
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

