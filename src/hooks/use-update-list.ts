import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query/queryClient";
import { toast } from "sonner";
import { updateList, UpdateListRequest } from "@/services/lists/update-list";

interface UseUpdateListProps {
  listId: string;
}

export const useUpdateList = ({ listId }: UseUpdateListProps) => {
  return useMutation({
    mutationFn: (payload: UpdateListRequest) => updateList(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["lists"] }),
        queryClient.invalidateQueries({ queryKey: ["lists", Number(listId)] }),
      ]);
      toast.success("Lista atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
