import { useQuery } from "@tanstack/react-query";
import { getContributions } from "@/services/contributions/get-contributions";

interface UseGetContributionsRequest {
  listId: string;
  enabled?: boolean;
}

export const useGetContributions = ({ listId, enabled = true }: UseGetContributionsRequest) => {
  return useQuery({
    queryKey: ["lists", listId, "contributions"],
    queryFn: () => getContributions({ listId }),
    enabled: !!listId && enabled,
  });
};

