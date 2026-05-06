import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { deleteGuest, DeleteGuestRequest } from "@/services/guests/delete-guest";

interface UseDeleteGuestProps {
  listId: string;
}

export const useDeleteGuest = ({ listId }: UseDeleteGuestProps) => {
  return useMutation({
    mutationFn: (payload: DeleteGuestRequest) => deleteGuest(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lists", listId, "guests"] });
      toast.success("Convidado removido com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
