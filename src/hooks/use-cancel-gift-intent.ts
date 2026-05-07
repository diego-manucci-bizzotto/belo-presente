import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { cancelGiftIntent, CancelGiftIntentRequest } from "@/services/share/cancel-gift-intent";

interface UseCancelGiftIntentProps {
  shareId: string;
}

export const useCancelGiftIntent = ({ shareId }: UseCancelGiftIntentProps) => {
  return useMutation({
    mutationFn: (payload: CancelGiftIntentRequest) => cancelGiftIntent(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["share", shareId, "products"] });
      toast.success("Selecao desmarcada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
