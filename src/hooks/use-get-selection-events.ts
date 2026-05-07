import { useQuery } from "@tanstack/react-query";
import { getSelectionEvents } from "@/services/notifications/get-selection-events";

interface UseGetSelectionEventsProps {
  listId: string;
  enabled?: boolean;
}

export const useGetSelectionEvents = ({ listId, enabled = true }: UseGetSelectionEventsProps) => {
  return useQuery({
    queryKey: ["lists", listId, "selection-events"],
    queryFn: () => getSelectionEvents({ listId }),
    enabled: !!listId && enabled,
  });
};
