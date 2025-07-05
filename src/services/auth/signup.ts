import {useMutation} from "@tanstack/react-query";
import {signup} from "@/lib/firebase/auth";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

export const useSignup = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await signup(email, password)
      return result.user
    },
    onSuccess: () => {
      router.push('/lists');
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