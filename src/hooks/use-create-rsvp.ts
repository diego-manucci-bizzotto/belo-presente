import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createRsvp, CreateRsvpRequest } from "@/services/share/create-rsvp";

export const useCreateRsvp = () => {
  return useMutation({
    mutationFn: (payload: CreateRsvpRequest) => createRsvp(payload),
    onSuccess: () => {
      toast.success("Presenca registrada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
