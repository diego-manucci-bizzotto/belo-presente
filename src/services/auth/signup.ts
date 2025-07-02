import {useMutation} from "@tanstack/react-query";
import {signup} from "@/lib/firebase/auth";
import {useAuthContext} from "@/providers/auth-provider";
import {toast} from "sonner";

export const useSignup = () => {
  const { setUser } = useAuthContext();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await signup(email, password)
      return result.user
    },
    onSuccess: (user) => {
      setUser(user);
      toast.success("Cadastro bem-sucedido!");
    },
    onError: (err) => {
      if (err instanceof Error && err.message.includes("email-already-in-use")) {
        toast.error("Este email já está em uso.");
        return;
      }
      toast.error("Erro ao cadastrar. Verifique suas credenciais.");
    }
  })
}