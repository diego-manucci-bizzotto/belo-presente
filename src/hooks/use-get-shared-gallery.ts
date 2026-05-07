import { useQuery } from "@tanstack/react-query";
import { getSharedGallery } from "@/services/share/get-shared-gallery";

interface UseGetSharedGalleryRequest {
  shareId: string;
}

export const useGetSharedGallery = ({ shareId }: UseGetSharedGalleryRequest) => {
  return useQuery({
    queryKey: ["share", shareId, "gallery"],
    queryFn: () => getSharedGallery({ shareId }),
    enabled: !!shareId,
  });
};

