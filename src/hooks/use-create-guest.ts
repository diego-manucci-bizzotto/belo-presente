import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { createGuest, CreateGuestRequest } from "@/services/guests/create-guest";

interface UseCreateGuestProps {
  listId: string;
}

export const useCreateGuest = ({ listId }: UseCreateGuestProps) => {
  return useMutation({
    mutationFn: (payload: CreateGuestRequest) => createGuest(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lists", listId, "guests"] });
      toast.success("Convidado criado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
