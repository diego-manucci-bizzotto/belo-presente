import {useQuery} from "@tanstack/react-query";
import {db} from "@/firebase/config";
import {doc, getDoc} from "firebase/firestore";

export const useGetList = (listId: string) => {
  return useQuery({
    queryKey: ["list", listId],
    queryFn: async () => {
      const docRef = doc(db, "list", listId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        throw new Error("List not found");
      }

      return { id: snapshot.id, ...snapshot.data() } as {
        id: string;
        title: string;
        category: string;
        ownerId: string;
        createdAt: string;
        active: number;
      };
    },
    enabled: !!listId,
  });
};
