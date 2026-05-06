import { useQuery } from "@tanstack/react-query";
import { getSharedNotes } from "@/services/share/get-shared-notes";

interface UseGetSharedNotesRequest {
  shareId: string;
  enabled?: boolean;
}

export const useGetSharedNotes = ({ shareId, enabled = true }: UseGetSharedNotesRequest) => {
  return useQuery({
    queryKey: ["share", shareId, "notes"],
    queryFn: () => getSharedNotes({ shareId }),
    enabled: !!shareId && enabled,
  });
};
