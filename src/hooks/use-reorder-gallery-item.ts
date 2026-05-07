import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { reorderGalleryItem, ReorderGalleryItemRequest } from "@/services/gallery/reorder-gallery-item";

interface UseReorderGalleryItemProps {
  listId: string;
}

export const useReorderGalleryItem = ({ listId }: UseReorderGalleryItemProps) => {
  return useMutation({
    mutationFn: (payload: ReorderGalleryItemRequest) => reorderGalleryItem(payload),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["lists", listId, "gallery"] });
      if (response.moved) {
        toast.success("Ordem atualizada com sucesso!");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

