"use client"

import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Textarea} from "@/components/ui/textarea";
import {Loader2Icon} from "lucide-react";
import {useState} from "react";
import CategoryButton from "@/components/app/lists/new/category-button";
import {useCreateList} from "@/hooks/use-create-list";

const categories = [
  { name: "Chá de Casa Nova", icon: "🏠" },
  { name: "Chá de Bebê", icon: "🍼" },
  { name: "Chá Revelação", icon: "💙🩷" },
  { name: "Chá de Fraldas", icon: "🩲" },
  { name: "Chá de Lingerie", icon: "👙" },
  { name: "Chá de Panela", icon: "🧑‍🍳" },
  { name: "Chá de Cozinha", icon: "🍴" },
  { name: "Casamento", icon: "💐" },
  { name: "Noivado", icon: "💍" },
  { name: "Quinze Anos", icon: "👧" },
  { name: "Aniversário", icon: "🎂" },
  { name: "Bodas", icon: "💎" },
  { name: "Festinha do Pet", icon: "🐶" },
  { name: "Festa Infantil", icon: "👠" },
  { name: "Formatura", icon: "🎓" },
  { name: "Dia dos Namorados", icon: "💞" },
  { name: "Natal", icon: "🎅" },
  { name: "Compras", icon: "🛒" },
  { name: "Outro", icon: "❓" },
];

const schema = z.object({
  title: z.string().min(1, "O título é obrigatório").max(128, "O título deve ter no máximo 128 caracteres"),
  description: z.string().max(512, "O descrição deve ter no máximo 512 caracteres").optional(),
  category: z.string().min(1, "A categoria é obrigatória")
});

type Schema = z.infer<typeof schema>;

export default function Page() {
  const router = useRouter();

  const createList = useCreateList();

  const [currentStep, setCurrentStep] = useState(0);

  const handleNextStep = async () => {
    if (currentStep === 0) {
      const isValid = await form.trigger(["title", "description"]);
      if (isValid) {
        setCurrentStep(1);
      }
    } else {
      await form.handleSubmit(onSubmit)();
    }
  }

  const handlePreviousStep = () => {
    if (currentStep === 0) {
      router.back();
    } else {
      setCurrentStep(currentStep - 1);
    }
  }

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      category: "Chá de Casa Nova"
    }
  });

  const selectedCategory = form.watch("category");

  const onSubmit = async ({title, description, category}: Schema) => {
    createList.mutate({
      title: title.trim(),
      description: description?.trim() ?? "",
      category: category
    })
  }

  return (
    <div className="flex flex-col gap-4 flex-grow p-4 items-center h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-full max-w-2xl' onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleNextStep();
          }
        }}>
          {currentStep === 0 && (
            <Card className="w-full max-w-2xl">
              <CardHeader className='flex'>
                <span className='text-2xl'>🎉</span>
                <div className='flex flex-col gap-1.5'>
                  <CardTitle>Dê um nome à sua lista de presentes e adicione uma descrição criativa!</CardTitle>
                  <CardDescription>
                    Sem pressão, você poderá mudar isso depois. Então, se quiser, mantenha tudo bem
                    simples por agora.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
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
                </div>
              </CardContent>
              <CardFooter className="flex flex gap-3 justify-end w-full">
                <Button type="button" variant='ghost' onClick={handlePreviousStep} className='min-w-20'>
                  Cancelar
                </Button>
                <Button type="button" disabled={createList.isPending} className="bg-[#b1563c] text-white hover:bg-[#a0452f] min-w-20" onClick={handleNextStep}>
                  {createList.isPending ? <Loader2Icon className="animate-spin"/> : "Avançar"}
                </Button>
              </CardFooter>
            </Card>
          )}
          { currentStep === 1 && (
            <Card className="w-full max-w-2xl h-[calc(100vh-80px-32px)] flex flex-col">
              <CardHeader className='flex'>
                <span className='text-2xl'>📌</span>
                <div className='flex flex-col gap-1.5'>
                  <CardTitle>Selecione o tipo de evento que melhor combina com sua lista de presentes!</CardTitle>
                  <CardDescription>
                    É só uma ajuda para organizar,sua escolha não restringe nada e pode ser alterada quando quiser.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className='flex-1 overflow-y-auto'>
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map(cat => (
                      <CategoryButton
                        key={cat.name}
                        onClick={() => form.setValue("category", cat.name)}
                        selected={selectedCategory === cat.name}
                        category={cat.name}
                        icon={cat.icon}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex gap-3 justify-end w-full flex-shrink-0">
                <Button type="button" variant='ghost' onClick={handlePreviousStep} className='min-w-20'>
                  Voltar
                </Button>
                <Button type="submit" disabled={createList.isPending} className="bg-[#b1563c] text-white hover:bg-[#a0452f] min-w-20">
                  {createList.isPending ? <Loader2Icon className="animate-spin"/> : "Salvar"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}