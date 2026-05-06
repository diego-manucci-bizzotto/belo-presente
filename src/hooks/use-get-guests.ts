import { useQuery } from "@tanstack/react-query";
import { getGuests } from "@/services/guests/get-guests";

interface UseGetGuestsRequest {
  listId: string;
  enabled?: boolean;
}

export const useGetGuests = ({ listId, enabled = true }: UseGetGuestsRequest) => {
  return useQuery({
    queryKey: ["lists", listId, "guests"],
    queryFn: () => getGuests({ listId }),
    enabled: !!listId && enabled,
  });
};
