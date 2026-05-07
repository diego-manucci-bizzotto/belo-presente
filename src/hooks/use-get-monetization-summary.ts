import { useQuery } from "@tanstack/react-query";
import { getMonetizationSummary } from "@/services/monetization/get-monetization-summary";

interface UseGetMonetizationSummaryProps {
  listId: string;
}

export const useGetMonetizationSummary = ({ listId }: UseGetMonetizationSummaryProps) => {
  return useQuery({
    queryKey: ["lists", listId, "monetization-summary"],
    queryFn: () => getMonetizationSummary({ listId }),
    enabled: !!listId,
  });
};

