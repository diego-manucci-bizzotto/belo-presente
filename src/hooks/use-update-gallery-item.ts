import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { updateGalleryItem, UpdateGalleryItemRequest } from "@/services/gallery/update-gallery-item";

interface UseUpdateGalleryItemProps {
  listId: string;
}

export const useUpdateGalleryItem = ({ listId }: UseUpdateGalleryItemProps) => {
  return useMutation({
    mutationFn: (payload: UpdateGalleryItemRequest) => updateGalleryItem(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lists", listId, "gallery"] });
      toast.success("Imagem atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

