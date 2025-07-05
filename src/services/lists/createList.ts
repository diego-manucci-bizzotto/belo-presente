import { useMutation } from "@tanstack/react-query";
import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { nanoid } from "nanoid";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

export const useCreateList = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async ({ title, description, ownerId }: {
      title: string;
      description: string;
      ownerId: string;
    }) => {
      const docRef = await addDoc(collection(db, "list"), {
        title,
        description,
        ownerId,
        shareId: nanoid(8),
        createdAt: serverTimestamp()
      });

      return docRef.id;
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
