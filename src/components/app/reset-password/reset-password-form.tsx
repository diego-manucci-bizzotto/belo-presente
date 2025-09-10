"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { useResetPassword } from "@/hooks/use-reset-password";

const schema = z.object({
  newPassword: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  confirmNewPassword: z.string().min(8, "A confirmação de senha deve ter pelo menos 8 caracteres")
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "As senhas não coincidem",
  path: ["confirmNewPassword"]
});

type Schema = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const resetPassword = useResetPassword();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: ""
    }
  });

  const onSubmit = ({ newPassword }: Schema) => {
    resetPassword.mutate({ token, newPassword });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel htmlFor="newPassword">Nova senha</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" id="newPassword" placeholder="Digite sua senha" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel htmlFor="confirmNewPassword">Confirme sua nova senha</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" id="confirmNewPassword" placeholder="Confirme sua senha" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={resetPassword.isPending}>
              {resetPassword.isPending ? <Loader2Icon className="animate-spin" /> : "Redefinir Senha"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}