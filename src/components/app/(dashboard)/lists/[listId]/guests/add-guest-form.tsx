"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateGuest } from "@/hooks/use-create-guest";
import { useUpdateGuest } from "@/hooks/use-update-guest";
import { CreateGuestResponse, GuestAttendeeType, GuestStatus } from "@/services/guests/create-guest";

const schema = z.object({
  name: z.string().min(1, "Nome obrigatorio").max(120, "Nome deve ter no maximo 120 caracteres"),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  phone: z.string().max(30, "Telefone invalido").optional().or(z.literal("")),
  note: z.string().max(512, "Observacao deve ter no maximo 512 caracteres").optional().or(z.literal("")),
  status: z.enum(["pending", "confirmed", "declined"], {
    errorMap: () => ({ message: "Selecione um status valido" }),
  }),
  attendee_type: z.enum(["adult", "child"], {
    errorMap: () => ({ message: "Selecione um tipo valido" }),
  }),
  has_companion: z.boolean(),
  companion_name: z.string().max(120, "Nome do acompanhante deve ter no maximo 120 caracteres").optional().or(z.literal("")),
}).superRefine((value, ctx) => {
  if (value.has_companion && !(value.companion_name || "").trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["companion_name"],
      message: "Nome do acompanhante e obrigatorio",
    });
  }
});

type FormMode = "create" | "edit";

interface AddGuestFormProps {
  listId: string;
  mode?: FormMode;
  guest?: CreateGuestResponse;
  handleSuccessAction: () => void;
  handleCancelAction: () => void;
}

const statusLabels: Record<GuestStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  declined: "Recusado",
};

const attendeeTypeLabels: Record<GuestAttendeeType, string> = {
  adult: "Adulto",
  child: "Crianca",
};

export function AddGuestForm({
  listId,
  mode = "create",
  guest,
  handleSuccessAction,
  handleCancelAction,
}: AddGuestFormProps) {
  const isEditMode = mode === "edit" && !!guest;
  const createGuest = useCreateGuest({ listId });
  const updateGuest = useUpdateGuest({ listId });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: guest?.name ?? "",
      email: guest?.email ?? "",
      phone: guest?.phone ?? "",
      note: guest?.note ?? "",
      status: guest?.status ?? "pending",
      attendee_type: guest?.attendee_type ?? "adult",
      has_companion: guest?.has_companion ?? false,
      companion_name: guest?.companion_name ?? "",
    },
  });

  const isPending = createGuest.isPending || updateGuest.isPending;
  const submitLabel = isEditMode ? "Salvar alteracoes" : "Salvar convidado";
  const hasCompanion = form.watch("has_companion");

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const payload = {
      name: data.name.trim(),
      email: data.email?.trim() || undefined,
      phone: data.phone?.trim() || undefined,
      note: data.note?.trim() || undefined,
      status: data.status,
      attendee_type: data.attendee_type,
      has_companion: data.has_companion,
      companion_name: data.has_companion ? data.companion_name?.trim() || undefined : undefined,
    };

    if (isEditMode && guest) {
      await updateGuest.mutateAsync({
        list_id: listId,
        guest_id: guest.id,
        guest: payload,
      });
    } else {
      await createGuest.mutateAsync({
        list_id: listId,
        guest: payload,
      });
      form.reset({
        name: "",
        email: "",
        phone: "",
        note: "",
        status: "pending",
        attendee_type: "adult",
        has_companion: false,
        companion_name: "",
      });
    }

    handleSuccessAction();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Maria Silva" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="maria@email.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="(11) 99999-9999" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status RSVP</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(Object.keys(statusLabels) as GuestStatus[]).map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusLabels[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="attendee_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(attendeeTypeLabels) as GuestAttendeeType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          {attendeeTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="has_companion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acompanhante</FormLabel>
                  <Select
                    value={field.value ? "yes" : "no"}
                    onValueChange={(value) => field.onChange(value === "yes")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vai com acompanhante?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no">Nao</SelectItem>
                      <SelectItem value="yes">Sim</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {hasCompanion ? (
            <FormField
              control={form.control}
              name="companion_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do acompanhante</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Joao Silva" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observacao (opcional)</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Informacao complementar sobre o convidado" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex gap-3 justify-end w-full mt-6">
          <Button type="button" variant="ghost" onClick={handleCancelAction} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2Icon className="animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
