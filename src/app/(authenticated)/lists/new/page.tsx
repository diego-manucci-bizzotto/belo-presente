"use client"

import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Textarea} from "@/components/ui/textarea";
import {useCreateList} from "@/services/lists/createList";
import {useAuth} from "@/hooks/use-auth";
import {Loader2Icon} from "lucide-react";

const schema = z.object({
  title: z.string().min(1, "O título é obrigatório").max(128, "O título deve ter no máximo 128 caracteres"),
  description: z.string().max(512, "O descrição deve ter no máximo 512 caracteres").optional(),
});

type Schema = z.infer<typeof schema>;

export default function ListsNew() {
  const router = useRouter();

  const {user} = useAuth();

  const createList = useCreateList();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: ""
    }
  });

  const onSubmit = async ({title, description}: Schema) => {
    createList.mutate({
      title: title.trim(),
      description: description?.trim() ?? "",
      ownerId: user?.uid || ""
    })
  }

  const navigateBack = () => {
    router.back();
  }

  return (
    <main className="flex flex-col gap-4 flex-grow p-4 justify-center items-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className='flex'>
          <span className='text-2xl'>🎉</span>
          <div className='flex flex-col gap-1.5'>
            <CardTitle>Dê um nome à sua lista de presentes e adicione uma descrição criativa!</CardTitle>
            <CardDescription>Sem pressão, você poderá mudar isso depois. Então, se quiser, mantenha tudo bem simples por agora.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({field}) => (
                      <FormItem className="w-full">
                        <FormLabel htmlFor="title">Título</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            id="title"
                            placeholder="Digite o título da lista"
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
                      name="description"
                      render={({field}) => (
                        <FormItem className="w-full">
                          <FormLabel htmlFor="description">Descrição</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              id="description"
                              placeholder="Digite uma descrição opcional para a sua lista"
                            />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex flex gap-3 justify-end">
                  <Button type="button" variant='ghost' onClick={navigateBack} className='min-w-20'>
                    Voltar
                  </Button>
                  <Button type="submit" disabled={createList.isPending} className="bg-[#b1563c] text-white hover:bg-[#a0452f] min-w-20">
                    {createList.isPending ? <Loader2Icon className="animate-spin"/> : "Salvar"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}