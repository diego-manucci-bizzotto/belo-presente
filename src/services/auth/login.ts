import {useMutation} from "@tanstack/react-query";
import {login} from "@/lib/firebase/auth";
import {useAuthContext} from "@/providers/auth-provider";
import {toast} from "sonner";

export const useLogin = () => {
  const { setUser } = useAuthContext();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await login(email, password)
      return result.user
    },
    onSuccess: (user) => {
      setUser(user);
      toast.success("Login bem-sucedido!");
    },
    onError: () => {
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
    }
  })
}