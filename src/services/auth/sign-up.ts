"use client";

import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

export const useSignUp = () => {

  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao cadastrar usuário");
      }

      return await response.json();
    },
    onSuccess: () => {
      router.push('/lists');
      toast.success("Cadastro bem-sucedido!");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar usuário");
    }
  })
}