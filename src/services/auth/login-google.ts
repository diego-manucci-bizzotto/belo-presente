import {useMutation} from "@tanstack/react-query";
import {loginWithGoogle} from "@/lib/firebase/auth";
import {useAuthContext} from "@/providers/auth-provider";
import {toast} from "sonner";

export const useLoginGoogle = () => {
  const { setUser } = useAuthContext();

  return useMutation({
    mutationFn: async () => {
      const result = await loginWithGoogle();
      return result.user;
    },
    onSuccess: (user) => {
      setUser(user);
      toast.success("Login com Google bem-sucedido!");
    },
    onError: () => {
      toast.error("Erro ao fazer login com Google. Tente novamente.");
    }
  })
}