"use client"

import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {signOut} from "next-auth/react";

export const useSignOut = () => {
  return useMutation({
    mutationFn: async () => {
      await signOut({callbackUrl: '/login'});
    },
    onSuccess: () => {

    },
    onError: () => {
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
    }
  })
}