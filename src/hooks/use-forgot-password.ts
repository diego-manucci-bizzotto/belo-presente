"use client"

import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {forgotPassword, ForgotPasswordRequest} from "@/services/auth/forgot-password";

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: ({email}: ForgotPasswordRequest) => forgotPassword({email}),
    onMutate: () => {
      toast.loading("Enviando email...", { id: "resetEmail" });
    },
    onSuccess: () => {
      toast.success("Email de redefinição de senha enviado com sucesso!", { id: "resetEmail" });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  })
};
