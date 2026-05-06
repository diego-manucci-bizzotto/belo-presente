import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { updateListFeatures, UpdateListFeaturesRequest } from "@/services/lists/update-list-features";

interface UseUpdateListFeaturesProps {
  listId: string;
}

export const useUpdateListFeatures = ({ listId }: UseUpdateListFeaturesProps) => {
  return useMutation({
    mutationFn: (payload: UpdateListFeaturesRequest) => updateListFeatures(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lists", listId, "features"] });
      toast.success("Funcionalidades atualizadas com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
