"use client"

import {use} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import Image from "next/image";
import {Card, CardContent} from "@/components/ui/card";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Textarea} from "@/components/ui/textarea";
import {useGetList} from "@/hooks/use-get-list";

const schema = z.object({
  url: z.string().url("URL inválida").optional(),
  name: z.string().min(1, "O nome é obrigatório").max(100, "O nome deve ter no máximo 100 caracteres"),
  description: z.string().max(512, "A descrição deve ter no máximo 512 caracteres").optional(),
  currency: z.string().min(1, "A moeda é obrigatória").max(10, "A moeda deve ter no máximo 10 caracteres"),
  price: z.number().positive("O preço deve ser um número positivo").max(999999.99, "O preço é muito alto").optional().nullable(),
  quantity: z.number().min(1, "A quantidade deve ser pelo menos 1").max(100, "A quantidade não pode ser maior que 100"),
  purchaseType: z.enum(["payment", "redirect"], {
    errorMap: () => ({message: "Selecione um tipo de compra válido"}),
  }),
  images: z.any().optional()
}).superRefine((data, ctx) => {
  if (data.purchaseType === "payment" && (data.price === undefined || isNaN(data.price))) {
    ctx.addIssue({
      path: ["price"],
      code: z.ZodIssueCode.custom,
      message: "O preço é obrigatório",
    });
  }

  if (data.images) {
    const files = Array.from(data.images);
    if (files.length > 10) {
      ctx.addIssue({
        path: ["images"],
        code: z.ZodIssueCode.too_big,
        maximum: 10,
        type: "array",
        inclusive: true,
        message: "Máximo de 10 imagens",
      });
    }

    for (const file of files) {
      if (!(file instanceof File)) {
        ctx.addIssue({
          path: ["images"],
          code: z.ZodIssueCode.invalid_type,
          expected: "File",
          received: typeof file,
          message: "Arquivo inválido",
        });
        break;
      }

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        ctx.addIssue({
          path: ["images"],
          code: z.ZodIssueCode.custom,
          message: "Apenas imagens JPEG, PNG ou WEBP são permitidas",
        });
      }

      if (file.size > 5 * 1024 * 1024) {
        ctx.addIssue({
          path: ["images"],
          code: z.ZodIssueCode.too_big,
          maximum: 5 * 1024 * 1024,
          type: "string",
          inclusive: true,
          message: "Imagem muito grande (máx. 5MB)",
        });
      }
    }
  }
});

export default function List({params}: { params: Promise<{ listId: string }> }) {
  const {listId} = use(params);

  const list = useGetList(Number(listId));

  const products = [1, 2, 3, 4, 5, 6, 7, 8];

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      url: "",
      name: "",
      description: "",
      currency: "Real",
      price: null,
      quantity: 1,
      purchaseType: "payment",
      images: null,
    }
  })

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log("Form submitted with data:", data);
    // Aqui você pode adicionar a lógica para enviar os dados do formulário
  }

  return (
    <>
      <div className='w-full flex flex-col gap-4'>
        <div className='flex justify-between items-center gap-4'>
          <Input
            placeholder='Filtrar produtos...'
            className='w-full md:max-w-sm'
          />
          <Dialog>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogTrigger asChild>
                  <Button className="bg-[#b1563c] text-white hover:bg-[#a0452f]">
                    <Plus/>
                    <span className='hidden md:block'>Adicionar produto</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>📦 Adicionar Produto</DialogTitle>
                    <DialogDescription>
                      Preencha os detalhes do produto para adicioná-lo à lista.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="url"
                        render={({field}) => (
                          <FormItem className="w-full">
                            <FormLabel>URL <span className='text-muted-foreground'>(opcional)</span></FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="url"
                                id="url"
                                placeholder="URL do produto"
                              />
                            </FormControl>
                            <FormMessage/>
                            <FormDescription>
                              Informe o link do produto. Usaremos essa URL para preencher automaticamente os dados quando possível.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                          <FormItem className="w-full">
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                id="name"
                                placeholder="Nome do produto"
                              />
                            </FormControl>
                            <FormMessage/>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                          <FormItem className="w-full">
                            <FormLabel>Descrição <span className='text-muted-foreground'>(opcional)</span></FormLabel>
                            <FormControl>
                            <Textarea
                                {...field}
                                id="description"
                                placeholder="Descrição do produto"
                              />
                            </FormControl>
                            <FormMessage/>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </form>
            </Form>
          </Dialog>
        </div>
        {products.length > 0 ? (
          <div className='flex flex-col gap-4 overflow-y-auto h-full'>
            {products.map((product, index) => (
              <Card key={index} className="flex flex-col md:flex-row gap-4 items-start p-4">
                <Image
                  src="https://picsum.photos/200"
                  alt={`Produto ${index + 1}`}
                  width={100}
                  height={100}
                  className="rounded object-cover w-full md:w-24 h-auto"
                />
                <CardContent className="p-0 flex flex-col gap-1">
                  <h3 className="text-md font-semibold">kkk</h3>
                  <p className="text-sm text-gray-500">aaaaaaaaaaaaaa</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className='h-full flex items-center justify-center'>
            <p className='text-gray-500'>Nenhum produto encontrado.</p>
          </div>
        )}
      </div>
    </>
  );
}