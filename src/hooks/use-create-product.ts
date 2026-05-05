import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query/queryClient";
import { createProduct, CreateProductRequest } from "@/services/products/create-product";

interface UseCreateProductProps {
  listId: string;
}

export const useCreateProduct = ({ listId }: UseCreateProductProps) => {
  return useMutation({
    mutationFn: (payload: CreateProductRequest) => createProduct(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lists", listId, "products"] });
      toast.success("Produto criado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
