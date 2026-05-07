import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createSharedContribution, CreateSharedContributionRequest } from "@/services/share/create-shared-contribution";

interface UseCreateSharedContributionProps {
  shareId: string;
}

export const useCreateSharedContribution = ({ shareId }: UseCreateSharedContributionProps) => {
  return useMutation({
    mutationFn: (payload: Omit<CreateSharedContributionRequest, "shareId">) =>
      createSharedContribution({
        shareId,
        ...payload,
      }),
    onSuccess: () => {
      toast.success("Contribuicao enviada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

