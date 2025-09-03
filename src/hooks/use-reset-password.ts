"use client"

import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {resetPassword, ResetPasswordRequest} from "@/services/auth/reset-password";

export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ token, newPassword }: ResetPasswordRequest) => resetPassword({ token, newPassword }),
    onSuccess: () => {
      router.push("/sign-in");
      toast.success("Senha redefinida com sucesso! Você pode fazer login agora.");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  })
}