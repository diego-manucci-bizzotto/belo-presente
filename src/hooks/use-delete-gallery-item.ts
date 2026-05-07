import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { deleteGalleryItem, DeleteGalleryItemRequest } from "@/services/gallery/delete-gallery-item";

interface UseDeleteGalleryItemProps {
  listId: string;
}

export const useDeleteGalleryItem = ({ listId }: UseDeleteGalleryItemProps) => {
  return useMutation({
    mutationFn: (payload: DeleteGalleryItemRequest) => deleteGalleryItem(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lists", listId, "gallery"] });
      toast.success("Imagem removida com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

