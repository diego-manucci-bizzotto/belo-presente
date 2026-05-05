import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/products/get-products";

interface UseGetProductsRequest {
  listId: string;
}

export const useGetProducts = ({ listId }: UseGetProductsRequest) => {
  return useQuery({
    queryKey: ["lists", listId, "products"],
    queryFn: () => getProducts({ listId }),
    enabled: !!listId,
  });
};
