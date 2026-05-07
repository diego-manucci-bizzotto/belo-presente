"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useCreateContribution } from "@/hooks/use-create-contribution";
import { useUpdateContribution } from "@/hooks/use-update-contribution";
import { Contribution, ContributionStatus } from "@/services/contributions/contribution-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const schema = z.object({
  contributor_name: z.string().min(2, "Digite o nome do contribuinte").max(120, "Nome muito longo"),
  contributor_contact: z.string().max(255, "Contato muito longo").optional().or(z.literal("")),
  message: z.string().max(512, "Mensagem muito longa").optional().or(z.literal("")),
  amount: z.coerce.number().positive("Digite um valor maior que zero"),
  currency: z.string().min(3, "Moeda invalida").max(10, "Moeda invalida"),
  status: z.enum(["pending", "received", "cancelled"], {
    errorMap: () => ({ message: "Selecione um status valido" }),
  }),
});

type Schema = z.infer<typeof schema>;

interface ContributionFormProps {
  listId: string;
  mode?: "create" | "edit";
  contribution?: Contribution;
  handleSuccessAction?: () => void;
  handleCancelAction?: () => void;
}

const statusLabels: Record<ContributionStatus, string> = {
  pending: "Pendente",
  received: "Recebida",
  cancelled: "Cancelada",
};

export function ContributionForm({
  listId,
  mode = "create",
  contribution,
  handleSuccessAction,
  handleCancelAction,
}: ContributionFormProps) {
  const createContribution = useCreateContribution({ listId });
  const updateContribution = useUpdateContribution({ listId });

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      contributor_name: contribution?.contributor_name ?? "",
      contributor_contact: contribution?.contributor_contact ?? "",
      message: contribution?.message ?? "",
      amount: contribution?.amount ?? 0,
      currency: contribution?.currency ?? "BRL",
      status: contribution?.status ?? "pending",
    },
  });

  const isPending = createContribution.isPending || updateContribution.isPending;

  const onSubmit = async (data: Schema) => {
    const payload = {
      contributor_name: data.contributor_name.trim(),
      contributor_contact: data.contributor_contact?.trim() || undefined,
      message: data.message?.trim() || undefined,
      amount: data.amount,
      currency: data.currency.trim().toUpperCase(),
      status: data.status,
    };

    if (mode === "create") {
      await createContribution.mutateAsync({
        list_id: listId,
        contribution: payload,
      });
    } else if (contribution) {
      await updateContribution.mutateAsync({
        list_id: listId,
        contribution_id: contribution.id,
        contribution: payload,
      });
    }

    handleSuccessAction?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="contributor_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do contribuinte</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Digite o nome" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contributor_contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contato (opcional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Email, telefone ou @usuario" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    placeholder="0.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moeda</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="BRL" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{statusLabels.pending}</SelectItem>
                      <SelectItem value="received">{statusLabels.received}</SelectItem>
                      <SelectItem value="cancelled">{statusLabels.cancelled}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem (opcional)</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Ex.: Presente em dinheiro para a viagem" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelAction}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-[#b1563c] text-white hover:bg-[#a0452f]"
            disabled={isPending}
          >
            {isPending && <Loader2Icon className="animate-spin" />}
            {mode === "create" ? "Salvar contribuicao" : "Salvar alteracoes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

