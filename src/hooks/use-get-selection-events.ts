import { useQuery } from "@tanstack/react-query";
import { getSelectionEvents } from "@/services/notifications/get-selection-events";

interface UseGetSelectionEventsProps {
  listId: string;
}

export const useGetSelectionEvents = ({ listId }: UseGetSelectionEventsProps) => {
  return useQuery({
    queryKey: ["lists", listId, "selection-events"],
    queryFn: () => getSelectionEvents({ listId }),
    enabled: !!listId,
  });
};
