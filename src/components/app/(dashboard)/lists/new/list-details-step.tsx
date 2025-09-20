"use client"

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";

interface ListDetailsStepProps {
  handleNextStepAction: () => void;
  handlePreviousStepAction: () => void;
  isPending: boolean;
}

export function ListDetailsStep({ handleNextStepAction, handlePreviousStepAction, isPending }: ListDetailsStepProps) {
  const form = useFormContext();

  return (
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
              render={({ field }) => (
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-3">
            <div className="flex items-center">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel htmlFor="description">Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        id="description"
                        placeholder="Digite uma descrição opcional para a sua lista"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex gap-3 justify-end w-full">
        <Button type="button" variant='ghost' onClick={handlePreviousStepAction} className='min-w-20'>
          Cancelar
        </Button>
        <Button type="button" disabled={isPending} className="bg-[#b1563c] text-white hover:bg-[#a0452f] min-w-20" onClick={handleNextStepAction}>
          {isPending ? <Loader2Icon className="animate-spin" /> : "Avançar"}
        </Button>
      </CardFooter>
    </Card>
  );
}