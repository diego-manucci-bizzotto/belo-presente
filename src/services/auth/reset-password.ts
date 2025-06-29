import {useMutation} from "@tanstack/react-query";
import {resetPassword} from "@/lib/firebase/auth";
import {toast} from "sonner";

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      return await resetPassword(email)
    },
    onSuccess: () => {
      toast.success("Email de redefinição de senha enviado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao enviar email de redefinição de senha. Verifique o email e tente novamente.");
    }
  })
}