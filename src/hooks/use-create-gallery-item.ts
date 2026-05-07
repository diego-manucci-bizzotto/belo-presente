import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { createGalleryItem, CreateGalleryItemRequest } from "@/services/gallery/create-gallery-item";

interface UseCreateGalleryItemProps {
  listId: string;
}

export const useCreateGalleryItem = ({ listId }: UseCreateGalleryItemProps) => {
  return useMutation({
    mutationFn: (payload: CreateGalleryItemRequest) => createGalleryItem(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lists", listId, "gallery"] });
      toast.success("Imagem adicionada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

