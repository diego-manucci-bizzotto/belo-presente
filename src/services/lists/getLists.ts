import {useQuery} from "@tanstack/react-query";
import {db} from "@/firebase/config";
import {collection, getDocs, where} from "firebase/firestore";
import {query} from "@firebase/database";

export const useGetLists = (userId: string) => {
  return useQuery({
    queryKey: ["lists", userId],
    queryFn: async () => {
      const q = query(collection(db, "list"), where("ownerId", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    },
    enabled: !!userId
  });
};
