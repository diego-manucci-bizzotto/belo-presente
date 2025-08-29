"use client"

import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ token, newPassword }: { token: string, newPassword: string}) => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token, newPassword })
      });

      if (!response.ok) {
        throw new Error("Erro ao redefinir a senha");
      }

      return response.json();
    },
    onSuccess: () => {
      router.push("/sign-in");
      toast.success("Senha redefinida com sucesso! Você pode fazer login agora.");
    },
    onError: () => {
      toast.error("Erro ao redefinir a senha.");
    }
  })
}