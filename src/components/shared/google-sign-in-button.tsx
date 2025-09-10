"use client";

import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {Loader2Icon} from "lucide-react";
import {useSignInGoogle} from "@/hooks/use-sign-in-google";

export function GoogleSignInButton() {
  const {signInGoogle, isPending} = useSignInGoogle();

  return (
    <Button type="button" onClick={() => signInGoogle()} variant="outline"
            disabled={isPending}
            className='flex'>
      <Image src='/google.png' alt='google' width={20} height={20}/>
      {isPending
        ? (
          <div className='flex-1 flex items-center justify-center mr-7'>
            <Loader2Icon className="animate-spin"/>
          </div>
        ) : <span className='flex-1 mr-7'>Entrar com Google</span>
      }
    </Button>
  );
}