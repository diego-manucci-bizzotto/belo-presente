"use client"

import {signIn} from "next-auth/react";
import {toast} from "sonner";
import {useState} from "react";

export const useLoginGoogle = () => {

  const [isPending, setIsPending] = useState(false);

  const loginGoogle = async () => {
    setIsPending(true);
    const response = await signIn("google", { redirect: false, callbackUrl: "/lists" });

    console.log(response);

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

  return {loginGoogle, isPending}
}