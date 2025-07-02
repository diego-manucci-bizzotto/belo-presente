import {useMutation} from "@tanstack/react-query";
import {login} from "@/lib/firebase/auth";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

export const useLogin = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await login(email, password)
      return result.user
    },
    onSuccess: () => {
      router.push('/dashboard');
      toast.success("Login bem-sucedido!");
    },
    onError: () => {
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
    }
  })
}