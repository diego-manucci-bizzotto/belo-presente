"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { ListDetailsStep } from "@/components/app/(dashboard)/lists/new/list-details-step";
import { CategoryStep } from "@/components/app/(dashboard)/lists/new/category-step";
import { useCreateList } from "@/hooks/use-create-list";

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

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      category: "Chá de Casa Nova"
    }
  });

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

  const onSubmit = async ({ title, description, category }: Schema) => {
    createList.mutateAsync({
      title: title.trim(),
      description: description?.trim() ?? "",
      category: category
    }).then(() => {
      router.push(`/lists`);
    })
  }

  const handleOnKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleNextStep();
    }
  }

  return (
    <div className="flex flex-col gap-4 flex-grow p-4 items-center h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-full max-w-2xl' onKeyDown={handleOnKeyDown}>
          {currentStep === 0 && (
            <ListDetailsStep
              handleNextStepAction={handleNextStep}
              handlePreviousStepAction={handlePreviousStep}
              isPending={createList.isPending}
            />
          )}
          {currentStep === 1 && (
            <CategoryStep
              categories={categories}
              handlePreviousStepAction={handlePreviousStep}
              isPending={createList.isPending}
            />
          )}
        </form>
      </Form>
    </div>
  );
}
