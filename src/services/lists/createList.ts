import { useMutation } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

export const useCreateList = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async ({ title, description, category, ownerId }: {
      title: string;
      description: string;
      category: string;
      ownerId: string;
    }) => {
      // const docRef = await addDoc(collection(db, "list"), {
      //   title,
      //   description,
      //   category,
      //   ownerId,
      //   shareId: nanoid(8),
      //   createdAt: serverTimestamp(),
      //   active: true
      // });
      //
      // return docRef.id;
    },
    onSuccess: (listId) => {
      toast.success("Lista criada com sucesso!");
      router.push("/lists");
    },
    onError: (error) => {
      toast.error("Erro ao criar lista. Tente novamente.");
    }
  });
};
