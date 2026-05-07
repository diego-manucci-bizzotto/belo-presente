import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { updateContribution, UpdateContributionRequest } from "@/services/contributions/update-contribution";

interface UseUpdateContributionProps {
  listId: string;
}

export const useUpdateContribution = ({ listId }: UseUpdateContributionProps) => {
  return useMutation({
    mutationFn: (payload: UpdateContributionRequest) => updateContribution(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lists", listId, "contributions"] });
      toast.success("Contribuicao atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

