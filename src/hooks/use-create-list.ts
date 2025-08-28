import {useMutation} from "@tanstack/react-query";
import {queryClient} from "@/lib/react-query/queryClient";
import {toast} from "sonner";
import {createList, CreateListRequest} from "@/services/lists/create-list";

export const useCreateList = () => {
  return useMutation({
    mutationFn: (list : CreateListRequest) => createList(list),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['lists']}).then(() =>{
        toast.success("Lista criada com sucesso!");
      });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
};
