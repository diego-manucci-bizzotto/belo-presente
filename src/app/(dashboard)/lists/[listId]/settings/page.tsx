"use client";

import {useEffect} from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useParams} from "next/navigation";
import {Loader2Icon} from "lucide-react";
import {useGetList} from "@/hooks/use-get-list";
import {useUpdateList} from "@/hooks/use-update-list";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Skeleton} from "@/components/ui/skeleton";
import CategoryButton from "@/components/app/(dashboard)/lists/new/category-button";

const schema = z.object({
  category: z.string().min(1, "Categoria obrigatoria"),
  status: z.enum(["active", "inactive"]),
});

type Schema = z.infer<typeof schema>;

const categories = [
  {name: "Chá de Casa Nova", icon: "🏠"},
  {name: "Chá de Bebê", icon: "🍼"},
  {name: "Chá Revelação", icon: "💙🩷"},
  {name: "Chá de Fraldas", icon: "🩲"},
  {name: "Chá de Lingerie", icon: "👙"},
  {name: "Chá de Panela", icon: "🧑‍🍳"},
  {name: "Chá de Cozinha", icon: "🍴"},
  {name: "Casamento", icon: "💐"},
  {name: "Noivado", icon: "💍"},
  {name: "Quinze Anos", icon: "👧"},
  {name: "Aniversário", icon: "🎂"},
  {name: "Bodas", icon: "💎"},
  {name: "Festinha do Pet", icon: "🐶"},
  {name: "Festa Infantil", icon: "👠"},
  {name: "Formatura", icon: "🎓"},
  {name: "Dia dos Namorados", icon: "💞"},
  {name: "Natal", icon: "🎄"},
  {name: "Compras", icon: "🛒"},
  {name: "Outro", icon: "❓"},
];

export default function Page() {
  const params = useParams<{ listId: string }>();
  const listId = params.listId;
  const list = useGetList({listId: Number(listId)});
  const updateList = useUpdateList({listId});

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (list.data) {
      form.reset({
        category: list.data.category ?? "",
        status: list.data.active ? "active" : "inactive",
      });
    }
  }, [form, list.data]);

  const onSubmit = async ({category, status}: Schema) => {
    if (!list.data) {
      return;
    }

    await updateList.mutateAsync({
      listId,
      title: list.data.title.trim(),
      description: list.data.description?.trim() ?? "",
      category: category.trim(),
      active: status === "active",
    });
  };

  if (list.isLoading || list.isPending) {
    return (
      <div className="w-full">
        <Skeleton className="h-[420px] w-full bg-gray-200"/>
      </div>
    );
  }

  if (!list.data) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">Nao foi possivel carregar as configuracoes da lista.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 overflow-scroll">
      <Card>
        <CardHeader>
          <CardTitle>Configuracoes da lista</CardTitle>
          <CardDescription>
            Atualize somente o status da lista e o tipo do evento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Status da lista</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="min-w-sm">
                          <SelectValue placeholder="Selecione o status"/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativa</SelectItem>
                          <SelectItem value="inactive">Pausada</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage/>
                    <FormDescription>
                      Quando desativada, sua lista fica pausada e nao aparece para convidados.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Tipo da lista</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
                        {categories.map((category) => (
                          <CategoryButton
                            key={category.name}
                            onClick={() => field.onChange(category.name)}
                            selected={field.value === category.name}
                            category={category.name}
                            icon={category.icon}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" className="bg-[#b1563c] text-white hover:bg-[#a0452f]"
                        disabled={updateList.isPending}>
                  {updateList.isPending && <Loader2Icon className="animate-spin"/>}
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
