"use client"

import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {signOut} from "next-auth/react";

export const useSignOut = () => {
  return useMutation({
    mutationFn: async () => await signOut({callbackUrl: '/sign-in'}),
    onError: () => {
      toast.error("Erro ao sair, tente novamente");
    }
  })
};