import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { deleteProduct, DeleteProductRequest } from "@/services/products/delete-product";

interface UseDeleteProductProps {
  listId: string;
}

export const useDeleteProduct = ({ listId }: UseDeleteProductProps) => {
  return useMutation({
    mutationFn: (payload: DeleteProductRequest) => deleteProduct(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lists", listId, "products"] });
      toast.success("Produto removido com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
