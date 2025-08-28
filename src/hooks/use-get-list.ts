import {useQuery} from "@tanstack/react-query";
import {getList} from "@/services/lists/get-list";

export const useGetList = (listId: number) => {
  return useQuery({
    queryKey: ["lists", listId],
    queryFn:() => getList(listId),
  });
};
