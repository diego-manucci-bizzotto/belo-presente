"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import Link from 'next/link';
import { useSignUp } from "@/hooks/use-sign-up";
import {GoogleSignInButton} from "@/components/shared/google-sign-in-button";
import {Separator} from "@/components/ui/separator";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string().min(8, "A confirmação de senha deve ter pelo menos 8 caracteres")
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

type Schema = z.infer<typeof schema>;

export function SignUpForm() {
  const signUp = useSignUp();

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = (data: Schema) => {
    signUp.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Digite seu email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel htmlFor="password">Senha</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" id="password" placeholder="Digite sua senha" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel htmlFor="confirmPassword">Confirme sua senha</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" id="confirmPassword" placeholder="Confirme sua senha" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={signUp.isPending}>
              {signUp.isPending ? <Loader2Icon className="animate-spin"/> : "Cadastrar"}
            </Button>
            <div className="flex gap-4 items-center">
              <Separator className='flex-1'/>
              <span className="text-sm text-muted-foreground">ou</span>
              <Separator className='flex-1'/>
            </div>
            <GoogleSignInButton/>
          </div>
          <div className="text-center text-sm">
            Já possui uma conta?{" "}
            <Link href="/sign-in" className="underline underline-offset-4">
              Entrar
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}