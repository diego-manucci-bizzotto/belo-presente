import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {queryClient} from "@/lib/react-query/queryClient";

export const useCreateList = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async ({ title, description, category }: {
      title: string;
      description: string;
      category: string;
    }) => {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar lista");
      }

      return await response.json();
    },
    onSuccess: async (listId) => {
      toast.success("Lista criada com sucesso!");
      await queryClient.invalidateQueries({ queryKey: ["lists"] });
      router.push("/lists");
    },
    onError: (error) => {
      toast.error("Erro ao criar lista. Tente novamente.");
    }
  });
};
