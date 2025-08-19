"use client";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {zodResolver} from "@hookform/resolvers/zod"
import * as z from "zod";
import {useForm} from "react-hook-form";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Loader2Icon} from "lucide-react";
import Image from "next/image";
import {useResetPassword} from "@/services/auth/reset-password";
import {useSearchParams} from "next/navigation";
import {cn} from "@/lib/utils";
import {Dancing_Script} from "next/font/google";

const DancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

const schema = z.object({
  newPassword: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  confirmNewPassword: z.string().min(8, "A confirmação de senha deve ter pelo menos 8 caracteres")
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "As senhas não coincidem",
  path: ["confirmNewPassword"]
});

type Schema = z.infer<typeof schema>;

export default function Page() {
  const resetPassword = useResetPassword();

  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const form = useForm({
      resolver: zodResolver(schema),
      defaultValues: {
        newPassword: "",
        confirmNewPassword: ""
      }
    }
  );

  const onSubmit = async ({newPassword}: Schema) => {
    resetPassword.mutate({token, newPassword});
  };

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
              <CardTitle>Redefinir Senha 🔑</CardTitle>
              <CardDescription>Digite sua nova senha para redefinir sua conta.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <FormField
                          control={form.control}
                          name="newPassword"
                          render={({field}) => (
                            <FormItem className="w-full">
                              <FormLabel htmlFor="newPassword">Nova senha</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  id="newPassword"
                                  placeholder="Digite sua senha"
                                />
                              </FormControl>
                              <FormMessage/>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <FormField
                          control={form.control}
                          name="confirmNewPassword"
                          render={({field}) => (
                            <FormItem className="w-full">
                              <FormLabel htmlFor="confirmNewPassword">Confirme sua nova senha</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  id="confirmNewPassword"
                                  placeholder="Confirme sua senha"
                                />
                              </FormControl>
                              <FormMessage/>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button type="submit" disabled={resetPassword.isPending}>
                        {resetPassword.isPending ? <Loader2Icon className="animate-spin"/> : "Redefinir Senha"}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}