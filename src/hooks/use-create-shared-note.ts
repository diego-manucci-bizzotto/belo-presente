import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { createSharedNote, CreateSharedNoteRequest } from "@/services/share/create-shared-note";

interface UseCreateSharedNoteProps {
  shareId: string;
}

export const useCreateSharedNote = ({ shareId }: UseCreateSharedNoteProps) => {
  return useMutation({
    mutationFn: (payload: CreateSharedNoteRequest) => createSharedNote(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["share", shareId, "notes"] });
      toast.success("Recado enviado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
