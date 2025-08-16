import {useQuery} from "@tanstack/react-query";

export const useGetLists = (userId: string) => {
  return useQuery({
    queryKey: ["lists", userId],
    queryFn: async () => {
      // const q = query(collection(db, "list"), where("ownerId", "==", userId));
      // const snapshot = await getDocs(q);
      // return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})) as {
      //   id: string;
      //   title: string;
      //   category: string;
      //   ownerId: string;
      //   createdAt: string;
      //   active: number;
      // }[];
    },
    enabled: !!userId
  });
};
