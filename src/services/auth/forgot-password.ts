"use client"

import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar email de redefinição de senha");
      }

      return response.json();
    },
    onMutate: () => {
      toast.loading("Enviando email...", { id: "resetEmail" });
    },
    onSuccess: () => {
      toast.success("Email de redefinição de senha enviado com sucesso!", { id: "resetEmail" });
    },
    onError: () => {
      toast.error("Falha ao enviar email de redefinição de senha.", { id: "resetEmail" });
    }
  })
}