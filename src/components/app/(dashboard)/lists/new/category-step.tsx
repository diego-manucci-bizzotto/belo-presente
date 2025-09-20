"use client"

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryButton from "@/components/app/lists/new/category-button";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";

interface CategoryStepProps {
  categories: { name: string; icon: string; }[];
  handlePreviousStepAction: () => void;
  isPending: boolean;
}

export function CategoryStep({ categories, handlePreviousStepAction, isPending }: CategoryStepProps) {
  const form = useFormContext();
  const selectedCategory = form.watch("category");

  return (
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
        <Button type="button" variant='ghost' onClick={handlePreviousStepAction} className='min-w-20'>
          Voltar
        </Button>
        <Button type="submit" disabled={isPending} className="bg-[#b1563c] text-white hover:bg-[#a0452f] min-w-20">
          {isPending ? <Loader2Icon className="animate-spin" /> : "Salvar"}
        </Button>
      </CardFooter>
    </Card>
  );
}