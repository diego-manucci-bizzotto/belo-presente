"use client";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {zodResolver} from "@hookform/resolvers/zod"
import * as z from "zod";
import {useForm} from "react-hook-form";
import {useSignIn} from "@/services/auth/sign-in";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Loader2Icon} from "lucide-react";
import Image from "next/image";
import {useSignInGoogle} from "@/services/auth/sign-in-google";
import {useForgotPassword} from "@/services/auth/forgot-password";
import {toast} from "sonner";
import Link from 'next/link';
import {useEffect} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {Dancing_Script} from "next/font/google";
import {cn} from "@/lib/utils";

const DancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres")
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

  const signIn = useSignIn();
  const signInGoogle = useSignInGoogle();
  const forgotPassword = useForgotPassword();

  const form = useForm({
      resolver: zodResolver(schema),
      defaultValues: {
        email: "",
        password: ""
      }
    }
  );

  const onSubmit = async ({email, password}: Schema) => {
    signIn.mutate({email, password});
  };

  const resetPasswordHandler = () => {
    const email = form.getValues("email");
    if (!email) {
      toast.error("Digite o email primeiro.");
      return;
    }
    forgotPassword.mutate(email);
  }

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
              <CardTitle>Entrar 😁</CardTitle>
              <CardDescription>Bem-vindo! Por favor, insira suas credenciais para acessar sua conta.</CardDescription>
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
                              <div className="flex items-center justify-between w-full">
                                <FormLabel htmlFor="password">Senha</FormLabel>
                                <Button
                                  type="button"
                                  variant='link'
                                  onClick={resetPasswordHandler}
                                  disabled={forgotPassword.isPending}
                                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline p-0 h-min"
                                >
                                  Esqueci minha senha
                                </Button>
                              </div>
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
                    <div className="flex flex-col gap-3">
                      <Button type="submit" disabled={signIn.isPending}>
                        {signIn.isPending ? <Loader2Icon className="animate-spin"/> : "Entrar"}
                      </Button>
                      <div className="flex gap-4 items-center">
                        <Separator className='flex-1'/>
                        <span className="text-sm text-muted-foreground">ou</span>
                        <Separator className='flex-1'/>
                      </div>
                      <Button type="button" onClick={() => signInGoogle.signInGoogle()} variant="outline"
                              disabled={signInGoogle.isPending}
                              className='flex'>
                        <Image src='/google.png' alt='google' width={20} height={20}/>
                        {signInGoogle.isPending
                          ? (
                            <div className='flex-1 flex items-center justify-center mr-7'>
                              <Loader2Icon className="animate-spin"/>
                            </div>
                          ) : <span className='flex-1 mr-7'>Entrar com Google</span>
                        }
                      </Button>
                    </div>
                    <div className="text-center text-sm">
                      Não possui uma conta?{" "}
                      <Link href="/sign-up" className="underline underline-offset-4">
                        Cadastre-se agora
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