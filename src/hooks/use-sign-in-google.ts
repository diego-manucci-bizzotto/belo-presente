"use client"

import {signIn} from "next-auth/react";
import {toast} from "sonner";
import {useState} from "react";

export const useSignInGoogle = () => {

  const [isPending, setIsPending] = useState(false);

  const signInGoogle = async () => {
    setIsPending(true);
    const response = await signIn("google", { redirect: false, callbackUrl: "/lists" });

    if (response?.error) {
      toast.error("Erro ao fazer login com Google.");
      setIsPending(false);
      return;
    }

    if (response?.url) {
      window.location.href = response.url;
      setIsPending(false);
      return;
    }
  };

  return {signInGoogle, isPending}
}