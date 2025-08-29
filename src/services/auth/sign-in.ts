"use client"

import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {signIn} from "next-auth/react";

export const useSignIn = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await signIn("credentials", {redirect: false, email, password});

      if (!response || response.error) {
        throw new Error(response?.error || "Erro ao fazer login.");
      }

      return response;
    },
    onSuccess: () => {
      router.push('/lists');
    },
    onError: () => {
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
    }
  })
}