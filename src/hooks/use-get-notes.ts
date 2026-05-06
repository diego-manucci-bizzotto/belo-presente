import { useQuery } from "@tanstack/react-query";
import { getNotes } from "@/services/notes/get-notes";

interface UseGetNotesRequest {
  listId: string;
  enabled?: boolean;
}

export const useGetNotes = ({ listId, enabled = true }: UseGetNotesRequest) => {
  return useQuery({
    queryKey: ["lists", listId, "notes"],
    queryFn: () => getNotes({ listId }),
    enabled: !!listId && enabled,
  });
};
