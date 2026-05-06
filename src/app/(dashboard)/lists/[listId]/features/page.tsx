"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, Star } from "lucide-react";
import { useGetListFeatures } from "@/hooks/use-get-list-features";
import { useUpdateListFeatures } from "@/hooks/use-update-list-features";
import { DEFAULT_LIST_FEATURE_FLAGS } from "@/lib/list-feature-flags";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const schema = z.object({
  attendance_confirmation_enabled: z.boolean(),
  notes_enabled: z.boolean(),
  contributions_enabled: z.boolean(),
  share_enabled: z.boolean(),
  selection_notifications_enabled: z.boolean(),
});

type Schema = z.infer<typeof schema>;

const featureRows: Array<{
  name: keyof Schema;
  title: string;
  description: string;
}> = [
  {
    name: "attendance_confirmation_enabled",
    title: "Confirmacao de Presenca",
    description: "Permita que seus convidados informem se vao ao seu evento ou nao.",
  },
  {
    name: "notes_enabled",
    title: "Recadinhos",
    description: "Permita que seus convidados deixem um recadinho publico na sua lista.",
  },
  {
    name: "contributions_enabled",
    title: "Contribuicoes",
    description: "Permita que seus convidados contribuam com dinheiro sem selecionar produto.",
  },
  {
    name: "share_enabled",
    title: "Compartilhar",
    description: "Mostre um botao de compartilhar na sua lista para os seus convidados.",
  },
  {
    name: "selection_notifications_enabled",
    title: "Notificacoes de Selecao",
    description: "Notifique por email quando um produto for selecionado ou desmarcado.",
  },
];

export default function Page() {
  const params = useParams<{ listId: string }>();
  const listId = params.listId;
  const features = useGetListFeatures({ listId });
  const updateListFeatures = useUpdateListFeatures({ listId });

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...DEFAULT_LIST_FEATURE_FLAGS,
    },
  });

  useEffect(() => {
    if (features.data) {
      form.reset({
        attendance_confirmation_enabled: features.data.attendance_confirmation_enabled,
        notes_enabled: features.data.notes_enabled,
        contributions_enabled: features.data.contributions_enabled,
        share_enabled: features.data.share_enabled,
        selection_notifications_enabled: features.data.selection_notifications_enabled,
      });
    }
  }, [features.data, form]);

  const onSubmit = async (data: Schema) => {
    await updateListFeatures.mutateAsync({
      listId,
      ...data,
    });
  };

  if (features.isLoading || features.isPending) {
    return (
      <div className="w-full flex flex-col gap-4">
        <Skeleton className="h-32 w-full bg-gray-200" />
        <Skeleton className="h-96 w-full bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 overflow-scroll">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Star className="text-yellow-500 fill-yellow-400 size-8 shrink-0 mt-1" />
            <div className="space-y-1">
              <CardTitle>Personalize as funcionalidades da sua lista</CardTitle>
              <CardDescription>
                Selecione quais funcionalidades voce deseja habilitar para esta lista.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Ativo</TableHead>
                    <TableHead>Funcionalidade</TableHead>
                    <TableHead className="hidden md:table-cell">Descricao</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureRows.map((feature) => (
                    <FormField
                      key={feature.name}
                      control={form.control}
                      name={feature.name}
                      render={({ field }) => (
                        <TableRow>
                          <TableCell className="align-top pt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => field.onChange(checked === true)}
                              />
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            <FormItem>
                              <FormLabel className="text-base">{feature.title}</FormLabel>
                              <p className="text-sm text-muted-foreground md:hidden">
                                {feature.description}
                              </p>
                            </FormItem>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {feature.description}
                          </TableCell>
                        </TableRow>
                      )}
                    />
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#b1563c] text-white hover:bg-[#a0452f]"
                  disabled={updateListFeatures.isPending}
                >
                  {updateListFeatures.isPending && <Loader2Icon className="animate-spin" />}
                  Salvar alteracoes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
