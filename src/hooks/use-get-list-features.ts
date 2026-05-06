import { useQuery } from "@tanstack/react-query";
import { getListFeatures } from "@/services/lists/get-list-features";

interface UseGetListFeaturesProps {
  listId: string;
}

export const useGetListFeatures = ({ listId }: UseGetListFeaturesProps) => {
  return useQuery({
    queryKey: ["lists", listId, "features"],
    queryFn: () => getListFeatures({ listId }),
    enabled: !!listId,
  });
};
