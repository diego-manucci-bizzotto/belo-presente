import { useQuery } from "@tanstack/react-query";
import { getSharedProducts } from "@/services/share/get-shared-products";

export const useGetSharedProducts = (shareId: string, guestPhone?: string) => {
  return useQuery({
    queryKey: ["share", shareId, "products", guestPhone ?? ""],
    queryFn: () => getSharedProducts({ shareId, guestPhone }),
    enabled: !!shareId,
  });
};
