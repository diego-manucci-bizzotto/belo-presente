import {useQuery} from "@tanstack/react-query";
import {toast} from "sonner";

interface GetListsResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  user_id: number;
  share_id: string;
  active: boolean;
}

export const useGetLists = () => {
  return useQuery({
    queryKey: ["lists"],
    queryFn: async () : Promise<GetListsResponse[]> => {
      const response = await fetch('/api/lists', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || "Erro ao buscar listas");
        throw new Error(errorData.error || "Erro ao buscar listas");
      }

      return await response.json();
    }
  });
};
