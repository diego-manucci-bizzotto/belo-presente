"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const schema = z.object({
  url: z.string().url("URL inválida").optional().or(z.literal('')),
  name: z.string().min(1, "O nome é obrigatório").max(100, "O nome deve ter no máximo 100 caracteres"),
  description: z.string().max(512, "A descrição deve ter no máximo 512 caracteres").optional(),
  currency: z.string().min(1, "A moeda é obrigatória").max(10, "A moeda deve ter no máximo 10 caracteres"),
  price: z.number().positive("O preço deve ser um número positivo").max(999999.99, "O preço é muito alto").optional().nullable(),
  quantity: z.number().min(1, "A quantidade deve ser pelo menos 1").max(100, "A quantidade não pode ser maior que 100"),
  purchaseType: z.enum(["payment", "redirect"], {
    errorMap: () => ({ message: "Selecione um tipo de compra válido" }),
  }),
  images: (typeof window === 'undefined' ? z.any() : z.instanceof(FileList)).optional()
}).superRefine((data, ctx) => {
  if (data.purchaseType === "payment" && (data.price === undefined || data.price === null || isNaN(data.price) || data.price <= 0)) {
    ctx.addIssue({ path: ["price"], code: z.ZodIssueCode.custom, message: "O preço é obrigatório e deve ser positivo" });
  }
  if (data.images) {
    const files = Array.from(data.images); // No longer need to cast
    if (files.length > 10) {
      ctx.addIssue({ path: ["images"], code: z.ZodIssueCode.too_big, maximum: 10, type: "array", inclusive: true, message: "Máximo de 10 imagens" });
    }
    for (const file of files as File[]) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        ctx.addIssue({ path: ["images"], code: z.ZodIssueCode.custom, message: "Apenas imagens JPEG, PNG ou WEBP são permitidas" });
      }
      if (file.size > 5 * 1024 * 1024) {
        ctx.addIssue({ path: ["images"], code: z.ZodIssueCode.too_big, maximum: 5 * 1024 * 1024, type: "string", inclusive: true, message: "Imagem muito grande (máx. 5MB)" });
      }
    }
  }
});

interface AddProductFormProps {
  handleSuccessAction: () => void;
  handleCancelAction: () => void;
}

export function AddProductForm({ handleSuccessAction, handleCancelAction }: AddProductFormProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      url: "", name: "", description: "", currency: "BRL",
      price: null, quantity: 1, purchaseType: "payment", images: null,
    }
  });
  const { control, watch } = form;
  const purchaseType = watch("purchaseType");

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log("Form submitted with data:", data);
    // TODO: Add your mutation logic here to save the product
    handleSuccessAction();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-6">
          <FormField
            control={control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL <span className='text-muted-foreground'>(opcional)</span></FormLabel>
                <FormControl>
                  <Input {...field} type="url" placeholder="https://exemplo.com/produto" />
                </FormControl>
                <FormDescription>
                  Se preenchido, tentaremos buscar os dados do produto automaticamente.
                </FormDescription>
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
                <FormLabel>Descrição <span className='text-muted-foreground'>(opcional)</span></FormLabel>
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
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {purchaseType === 'payment' && (
            <div className="grid grid-cols-2 gap-4">
              <FormField control={control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="0,00" value={field.value ?? ""} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={control} name="currency" render={({ field }) => (
                <FormItem>
                  <FormLabel>Moeda</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione a moeda" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="BRL">Real (BRL)</SelectItem>
                      <SelectItem value="USD">Dólar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          )}
          <FormField
            control={control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade desejada</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="1" value={field.value ?? 1} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagens <span className='text-muted-foreground'>(até 10)</span></FormLabel>
                <FormControl>
                  <Input type="file" multiple onChange={(e) => field.onChange(e.target.files)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCancelAction}>Cancelar</Button>
          <Button type="submit">Salvar produto</Button>
        </div>
      </form>
    </Form>
  );
}