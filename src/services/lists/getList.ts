import {useQuery} from "@tanstack/react-query";
import {toast} from "sonner";

interface GetListResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  user_id: number;
  share_id: string;
  active: boolean;
}

export const useGetList = (listId: number) => {
  return useQuery({
    queryKey: ["lists", listId],
    queryFn: async () : Promise<GetListResponse> => {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || "Erro ao buscar lista");
        throw new Error(errorData.error || "Erro ao buscar lista");
      }

      return await response.json();
    },
  });
};
