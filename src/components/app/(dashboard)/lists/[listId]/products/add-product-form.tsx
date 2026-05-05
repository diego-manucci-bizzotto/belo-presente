"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateProduct } from "@/hooks/use-create-product";

const schema = z.object({
  autofill: z.boolean(),
  url: z.string().url("URL invalida").optional().or(z.literal("")),
  imageUrl: z.string().url("URL da imagem invalida").optional().or(z.literal("")),
  name: z.string().min(1, "O nome e obrigatorio").max(100, "O nome deve ter no maximo 100 caracteres"),
  description: z.string().max(512, "A descricao deve ter no maximo 512 caracteres").optional(),
  currency: z.string().min(1, "A moeda e obrigatoria").max(10, "A moeda deve ter no maximo 10 caracteres"),
  price: z.number().positive("O preco deve ser um numero positivo").max(999999.99, "O preco e muito alto").optional().nullable(),
  quantity: z.number().int().min(1, "A quantidade deve ser pelo menos 1").max(100, "A quantidade nao pode ser maior que 100"),
  purchaseType: z.enum(["payment", "redirect", "free"], {
    errorMap: () => ({ message: "Selecione um tipo de compra valido" }),
  }),
}).superRefine((data, ctx) => {
  if (data.purchaseType === "payment" && (data.price === undefined || data.price === null || Number.isNaN(data.price) || data.price <= 0)) {
    ctx.addIssue({
      path: ["price"],
      code: z.ZodIssueCode.custom,
      message: "O preco e obrigatorio e deve ser positivo",
    });
  }

  if (data.purchaseType === "redirect" && !data.url) {
    ctx.addIssue({
      path: ["url"],
      code: z.ZodIssueCode.custom,
      message: "A URL e obrigatoria para redirecionamento",
    });
  }
});

interface AddProductFormProps {
  listId: string;
  handleSuccessAction: () => void;
  handleCancelAction: () => void;
}

export function AddProductForm({
  listId,
  handleSuccessAction,
  handleCancelAction,
}: AddProductFormProps) {
  const createProduct = useCreateProduct({ listId });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      autofill: true,
      url: "",
      imageUrl: "",
      name: "",
      description: "",
      currency: "BRL",
      price: null,
      quantity: 1,
      purchaseType: "payment",
    },
  });

  const { control, watch } = form;
  const purchaseType = watch("purchaseType");

  useEffect(() => {
    if (purchaseType === "payment") {
      form.setValue("currency", "BRL", { shouldValidate: true });
    }
  }, [form, purchaseType]);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    await createProduct.mutateAsync({
      list_id: listId,
      product: {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        url: data.url?.trim() || undefined,
        image_url: data.imageUrl?.trim() || undefined,
        price: data.price ?? undefined,
        currency: data.currency.trim().toUpperCase(),
        quantity: data.quantity,
        purchase_type: data.purchaseType,
      },
    });

    form.reset();
    handleSuccessAction();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          <FormField
            control={control}
            name="autofill"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Buscar produto automaticamente</FormLabel>
                  <FormDescription>
                    Se marcado, tentaremos buscar os dados do produto automaticamente a partir da URL.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL <span className="text-muted-foreground">(opcional)</span></FormLabel>
                <FormControl>
                  <Input {...field} type="url" placeholder="https://exemplo.com/produto" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do produto</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Jogo de panelas" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descricao <span className="text-muted-foreground">(opcional)</span></FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Descreva o produto..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="purchaseType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Como os convidados podem presentear?</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="payment" /></FormControl>
                      <FormLabel className="font-normal">Receber o valor em dinheiro via PIX</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="redirect" /></FormControl>
                      <FormLabel className="font-normal">Redirecionar para um site externo para a compra</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="free" /></FormControl>
                      <FormLabel className="font-normal">Presente livre (sem pagamento e sem redirecionamento)</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4 items-start">
            <FormField
              control={control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moeda</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={purchaseType === "payment" ? "BRL" : field.value}
                    disabled={purchaseType === "payment"}
                  >
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione a moeda" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="BRL">Real (BRL)</SelectItem>
                      <SelectItem value="USD">Dolar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preco</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      className="w-full"
                    />
                  </FormControl>
                  {purchaseType === "payment" ? (
                    <FormDescription>O valor que voce gostaria de receber por este produto</FormDescription>
                  ) : purchaseType === "redirect" ? (
                    <FormDescription>Informe o valor aproximado do produto (opcional)</FormDescription>
                  ) : (
                    <FormDescription>Opcional para presentes livres</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="1" value={field.value ?? 1} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormDescription>Quantos itens deste produto voce gostaria de receber</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL da imagem <span className="text-muted-foreground">(opcional)</span></FormLabel>
                <FormControl>
                  <Input {...field} type="url" placeholder="https://exemplo.com/imagem.jpg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex gap-3 justify-end w-full mt-6">
          <Button type="button" variant="ghost" onClick={handleCancelAction} disabled={createProduct.isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createProduct.isPending}>
            {createProduct.isPending ? <Loader2Icon className="animate-spin" /> : "Salvar produto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
