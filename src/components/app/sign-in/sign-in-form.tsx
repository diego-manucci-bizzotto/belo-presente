"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { useSignIn } from "@/hooks/use-sign-in";
import { useForgotPassword } from "@/hooks/use-forgot-password";
import { toast } from "sonner";
import Link from "next/link";
import {Separator} from "@/components/ui/separator";
import {GoogleSignInButton} from "@/components/shared/google-sign-in-button";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres")
});

type Schema = z.infer<typeof schema>;

export function SignInForm() {
  const signIn = useSignIn();
  const forgotPassword = useForgotPassword();

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = (data: Schema) => {
    signIn.mutate(data);
  };

  const resetPasswordHandler = () => {
    const email = form.getValues("email");
    if (!email) {
      toast.error("Digite o email primeiro");
      return;
    }
    forgotPassword.mutate({ email });
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
                    <Input {...field} type="password" id="password" placeholder="Digite sua senha" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <GoogleSignInButton/>
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
  );
}