"use client";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {zodResolver} from "@hookform/resolvers/zod"
import * as z from "zod";
import {useForm} from "react-hook-form";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Loader2Icon} from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import {useSignup} from "@/services/auth/signup";
import {useLoginGoogle} from "@/services/auth/login-google";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string().min(8, "A confirmação de senha deve ter pelo menos 8 caracteres")
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

type Schema = z.infer<typeof schema>;

export default function Page() {

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace("/lists");
    }
  }, [session, router]);

  const signup = useSignup();
  const loginGoogle = useLoginGoogle();

  const form = useForm({
      resolver: zodResolver(schema),
      defaultValues: {
        email: "",
        password: "",
        confirmPassword: ""
      }
    }
  );

  const onSubmit = async ({email, password}: Schema) => {
    signup.mutate({email, password});
  };

  return (
    <div className='bg-wave'>
      <main className='container mx-auto min-h-svh h-svh p-6 md:p-10'>
        <div className="flex flex-col gap-6 items-center justify-center h-full">
          <div className='flex items-center'>
            <Image src="/images/logo.svg" alt="logo" width={1024} height={1024} className="w-14 h-auto"/>
            <h1 className="text-4xl font-bold ml-4 text-primary">Belo Presente</h1>
          </div>
          <Card className="w-full max-w-sm mb-14">
            <CardHeader>
              <CardTitle>Cadastre-se 👋️</CardTitle>
              <CardDescription>Bem-vindo! Por favor, insira suas credenciais para criar uma conta.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                          <FormItem className="w-full">
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                id="email"
                                placeholder="Digite seu email"
                              />
                            </FormControl>
                            <FormMessage/>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({field}) => (
                            <FormItem className="w-full">
                              <FormLabel htmlFor="password">Senha</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  id="password"
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
                          name="confirmPassword"
                          render={({field}) => (
                            <FormItem className="w-full">
                              <FormLabel htmlFor="password">Confirme sua senha</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  id="password"
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
                      <Button type="submit" disabled={signup.isPending}>
                        {signup.isPending ? <Loader2Icon className="animate-spin"/> : "Cadastrar"}
                      </Button>
                      <div className="flex gap-4 items-center">
                        <Separator className='flex-1'/>
                        <span className="text-sm text-muted-foreground">ou</span>
                        <Separator className='flex-1'/>
                      </div>
                      <Button type="button" onClick={() => loginGoogle.loginGoogle()} variant="outline"
                              disabled={loginGoogle.isPending} className='flex'>
                        <Image src='/icons/google.png' alt='google' width={20} height={20}/>
                        {loginGoogle.isPending
                          ? (
                            <div className='flex-1 flex items-center justify-center mr-7'>
                              <Loader2Icon className="animate-spin"/>
                            </div>
                          ) : <span className='flex-1 mr-7'>Entrar com Google</span>
                        }
                      </Button>
                    </div>
                    <div className="text-center text-sm">
                      Já possui uma conta?{" "}
                      <Link href="/login" className="underline underline-offset-4">
                        Entrar
                      </Link>
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