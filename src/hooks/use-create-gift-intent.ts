import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { createGiftIntent, CreateGiftIntentRequest } from "@/services/share/create-gift-intent";

interface UseCreateGiftIntentProps {
  shareId: string;
}

export const useCreateGiftIntent = ({ shareId }: UseCreateGiftIntentProps) => {
  return useMutation({
    mutationFn: (payload: CreateGiftIntentRequest) => createGiftIntent(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["share", shareId, "products"] });
      toast.success("Presente registrado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
