import {QueryCache, QueryClient} from "@tanstack/query-core";
import {toast} from "sonner";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error.message || "Algo deu errado");
    },
  }),
});

export {queryClient};