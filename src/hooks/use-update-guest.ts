import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { updateGuest, UpdateGuestRequest } from "@/services/guests/update-guest";

interface UseUpdateGuestProps {
  listId: string;
}

export const useUpdateGuest = ({ listId }: UseUpdateGuestProps) => {
  return useMutation({
    mutationFn: (payload: UpdateGuestRequest) => updateGuest(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lists", listId, "guests"] });
      toast.success("Convidado atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
