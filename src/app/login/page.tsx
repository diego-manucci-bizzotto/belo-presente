"use client";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {zodResolver} from "@hookform/resolvers/zod"
import * as z from "zod";
import {useForm} from "react-hook-form";
import {useLogin} from "@/services/auth/login";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Loader2Icon} from "lucide-react";
import Image from "next/image";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres")
});

type Schema = z.infer<typeof schema>;

export default function Login() {

  const {mutate, isPending} = useLogin();

  const form = useForm({
      resolver: zodResolver(schema),
      defaultValues: {
        email: "",
        password: ""
      }
    }
  );

  const onSubmit = async ({email, password}: Schema) => {
    mutate({email, password});
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login 🗝️</CardTitle>
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
                            <a
                              href="#"
                              className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                            >
                              Esqueci minha senha
                            </a>
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
                  <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2Icon className="animate-spin"/> : "Entrar"}
                  </Button>
                  <div className="flex gap-4 items-center">
                    <Separator className='flex-1'/>
                    <span className="text-sm text-muted-foreground">ou</span>
                    <Separator className='flex-1'/>
                  </div>
                  <Button type="button" variant="outline" className='flex'>
                    <Image src='/icons/google.png' alt='google' width={20} height={20}/>
                    <span className='flex-1 pr-5'>Entrar com Google</span>
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Não possui uma conta?{" "}
                  <a href="#" className="underline underline-offset-4">
                    Cadastre-se agora
                  </a>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}