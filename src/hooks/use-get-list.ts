import {useQuery} from "@tanstack/react-query";
import {getList, GetListRequest} from "@/services/lists/get-list";

export const useGetList = ({listId}: GetListRequest) => {
  return useQuery({
    queryKey: ["lists", listId],
    queryFn:() => getList({listId}),
    enabled: !!listId,
  });
};
