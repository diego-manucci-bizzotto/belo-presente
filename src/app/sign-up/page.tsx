"use client";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Image from "next/image";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useEffect} from "react";
import {Dancing_Script} from "next/font/google";
import {cn} from "@/lib/utils";
import {SignUpForm} from "@/components/app/sign-up/sign-up-form";

const DancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

export default function Page() {

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace("/lists");
    }
  }, [session, router]);

  return (
    <div className='bg-wave'>
      <main className='container mx-auto min-h-svh h-svh p-6 md:p-10'>
        <div className="flex flex-col gap-6 items-center justify-center h-full">
          <div className='flex items-center'>
            <Image src="/logo.svg" alt="logo" width={1024} height={1024} className="w-14 h-auto"/>
            <h1 className={cn(`${DancingScript.className}`, "text-5xl font-bold ml-4 text-primary")}>Belo Presente</h1>
          </div>
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Cadastre-se 👋️</CardTitle>
              <CardDescription>Bem-vindo(a)! Por favor, insira suas credenciais para criar uma conta.</CardDescription>
            </CardHeader>
            <CardContent>
              <SignUpForm/>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}