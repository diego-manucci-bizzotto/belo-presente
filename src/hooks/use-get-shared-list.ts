import { useQuery } from "@tanstack/react-query";
import { getSharedList } from "@/services/share/get-shared-list";

export const useGetSharedList = (shareId: string) => {
  return useQuery({
    queryKey: ["share", shareId, "list"],
    queryFn: () => getSharedList({ shareId }),
    enabled: !!shareId,
  });
};
