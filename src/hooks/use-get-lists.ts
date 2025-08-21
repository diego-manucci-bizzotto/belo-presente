import {useQuery} from "@tanstack/react-query";
import {getLists} from "@/services/lists/get-lists";

export const useGetLists = () => {
  return useQuery({
    queryKey: ["lists"],
    queryFn: async ()  => getLists(),
  });
};
