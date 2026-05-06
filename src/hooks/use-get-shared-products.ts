import { useQuery } from "@tanstack/react-query";
import { getSharedProducts } from "@/services/share/get-shared-products";

export const useGetSharedProducts = (shareId: string) => {
  return useQuery({
    queryKey: ["share", shareId, "products"],
    queryFn: () => getSharedProducts({ shareId }),
    enabled: !!shareId,
  });
};
