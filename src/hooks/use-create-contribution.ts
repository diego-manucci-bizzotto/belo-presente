import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { createContribution, CreateContributionRequest } from "@/services/contributions/create-contribution";

interface UseCreateContributionProps {
  listId: string;
}

export const useCreateContribution = ({ listId }: UseCreateContributionProps) => {
  return useMutation({
    mutationFn: (payload: CreateContributionRequest) => createContribution(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lists", listId, "contributions"] });
      toast.success("Contribuicao registrada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

