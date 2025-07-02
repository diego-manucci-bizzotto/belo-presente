import {useMutation} from "@tanstack/react-query";
import {loginWithGoogle} from "@/lib/firebase/auth";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

export const useLoginGoogle = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      const result = await loginWithGoogle();
      return result.user;
    },
    onSuccess: () => {
      router.push('/dashboard');
      toast.success("Login com Google bem-sucedido!");
    },
    onError: () => {
      toast.error("Erro ao fazer login com Google. Tente novamente.");
    }
  })
}