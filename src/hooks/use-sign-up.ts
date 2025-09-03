"use client"

import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {signUp, SignUpRequest} from "@/services/auth/sign-up";

export const useSignUp = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async ({ email, password }: SignUpRequest) => signUp({email, password}),
    onSuccess: () => {
      router.push('/lists');
      toast.success("Cadastro bem-sucedido!");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  })
}