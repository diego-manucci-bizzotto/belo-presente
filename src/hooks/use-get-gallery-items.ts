import { useQuery } from "@tanstack/react-query";
import { getGalleryItems } from "@/services/gallery/get-gallery-items";

interface UseGetGalleryItemsRequest {
  listId: string;
}

export const useGetGalleryItems = ({ listId }: UseGetGalleryItemsRequest) => {
  return useQuery({
    queryKey: ["lists", listId, "gallery"],
    queryFn: () => getGalleryItems({ listId }),
    enabled: !!listId,
  });
};

