import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { deleteNote, DeleteNoteRequest } from "@/services/notes/delete-note";

interface UseDeleteNoteProps {
  listId: string;
}

export const useDeleteNote = ({ listId }: UseDeleteNoteProps) => {
  return useMutation({
    mutationFn: (payload: DeleteNoteRequest) => deleteNote(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lists", listId, "notes"] });
      toast.success("Recado removido com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
