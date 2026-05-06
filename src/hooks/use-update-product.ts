import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { updateProduct, UpdateProductRequest } from "@/services/products/update-product";

interface UseUpdateProductProps {
  listId: string;
}

export const useUpdateProduct = ({ listId }: UseUpdateProductProps) => {
  return useMutation({
    mutationFn: (payload: UpdateProductRequest) => updateProduct(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lists", listId, "products"] });
      toast.success("Produto atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
