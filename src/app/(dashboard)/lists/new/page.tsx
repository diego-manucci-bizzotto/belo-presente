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
import {useState} from "react";
import CategoryButton from "@/components/lists/new/category-button";

const schema = z.object({
  title: z.string().min(1, "O título é obrigatório").max(128, "O título deve ter no máximo 128 caracteres"),
  description: z.string().max(512, "O descrição deve ter no máximo 512 caracteres").optional(),
  category: z.string().min(1, "A categoria é obrigatória")
});

type Schema = z.infer<typeof schema>;

export default function ListsNew() {
  const router = useRouter();

  const {user} = useAuth();

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
      category: category,
      ownerId: user?.uid || ""
    })
  }

  return (
    <div className="flex flex-col gap-4 flex-grow p-4 justify-center items-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-full max-w-2xl'>
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
                  <div className="flex flex gap-3 justify-end">
                    <Button type="button" variant='ghost' onClick={handlePreviousStep} className='min-w-20'>
                      Cancelar
                    </Button>
                    <Button type="button" disabled={createList.isPending} className="bg-[#b1563c] text-white hover:bg-[#a0452f] min-w-20" onClick={handleNextStep}>
                      {createList.isPending ? <Loader2Icon className="animate-spin"/> : "Salvar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          { currentStep === 1 && (
            <Card className="w-full max-w-2xl">
              <CardHeader className='flex'>
                <span className='text-2xl'>📌</span>
                <div className='flex flex-col gap-1.5'>
                  <CardTitle>Selecione o tipo de evento que melhor combina com sua lista de presentes!</CardTitle>
                  <CardDescription>
                    É só uma ajuda para organizar,sua escolha não restringe nada e pode ser alterada quando quiser.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-3 gap-4">
                    <CategoryButton
                      onClick={() => form.setValue("category", "Chá de Casa Nova")}
                      selected={selectedCategory === "Chá de Casa Nova"}
                      category="Chá de Casa Nova"
                      icon="🏠"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Chá de Bebê")}
                      selected={selectedCategory === "Chá de Bebê"}
                      category="Chá de Bebê"
                      icon="🍼"
                    />
                    <CategoryButton
                      onClick={() => {form.setValue("category", "Chá Revelação")}}
                      selected={selectedCategory === "Chá Revelação"}
                      category="Chá Revelação"
                      icon="💙🩷"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Chá de Fraldas")}
                      selected={selectedCategory === "Chá de Fraldas"}
                      category="Chá de Fraldas"
                      icon="🩲"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Chá de Lingerie")}
                      selected={selectedCategory === "Chá de Lingerie"}
                      category="Chá de Lingerie"
                      icon="👙"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Chá de Panela")}
                      selected={selectedCategory === "Chá de Panela"}
                      category="Chá de Panela"
                      icon="🧑‍🍳"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Chá de Cozinha")}
                      selected={selectedCategory === "Chá de Cozinha"}
                      category="Chá de Cozinha"
                      icon="🍴"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Casamento")}
                      selected={selectedCategory === "Casamento"}
                      category="Casamento"
                      icon="💐"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Noivado")}
                      selected={selectedCategory === "Noivado"}
                      category="Noivado"
                      icon="💍"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Quinze Anos")}
                      selected={selectedCategory === "Quinze Anos"}
                      category="Quinze Anos"
                      icon="👧"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Aniversário")}
                      selected={selectedCategory === "Aniversário"}
                      category="Aniversário"
                      icon="🎂"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Bodas")}
                      selected={selectedCategory === "Bodas"}
                      category="Bodas"
                      icon="💎"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Festinha do Pet")}
                      selected={selectedCategory === "Festinha do Pet"}
                      category="Festinha do Pet"
                      icon="🐶"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Festa Infantil")}
                      selected={selectedCategory === "Festa Infantil"}
                      category="Festa Infantil"
                      icon="👠"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Formatura")}
                      selected={selectedCategory === "Formatura"}
                      category="Formatura"
                      icon="🎓"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Dia dos Namorados")}
                      selected={selectedCategory === "Dia dos Namorados"}
                      category="Dia dos Namorados"
                      icon="💞"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Natal")}
                      selected={selectedCategory === "Natal"}
                      category="Natal"
                      icon="🎅"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Compras")}
                      selected={selectedCategory === "Compras"}
                      category="Compras"
                      icon="🛒"
                    />
                    <CategoryButton
                      onClick={() => form.setValue("category", "Outro")}
                      selected={selectedCategory === "Outro"}
                      category="Outro"
                      icon="❓"
                    />
                  </div>
                  <div className="flex flex gap-3 justify-end">
                    <Button type="button" variant='ghost' onClick={handlePreviousStep} className='min-w-20'>
                      Voltar
                    </Button>
                    <Button type="submit" disabled={createList.isPending} className="bg-[#b1563c] text-white hover:bg-[#a0452f] min-w-20">
                      {createList.isPending ? <Loader2Icon className="animate-spin"/> : "Salvar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}