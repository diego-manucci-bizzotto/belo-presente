import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { deleteContribution, DeleteContributionRequest } from "@/services/contributions/delete-contribution";

interface UseDeleteContributionProps {
  listId: string;
}

export const useDeleteContribution = ({ listId }: UseDeleteContributionProps) => {
  return useMutation({
    mutationFn: (payload: DeleteContributionRequest) => deleteContribution(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lists", listId, "contributions"] });
      toast.success("Contribuicao removida com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

