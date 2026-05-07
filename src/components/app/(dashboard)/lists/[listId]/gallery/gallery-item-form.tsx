"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useCreateGalleryItem } from "@/hooks/use-create-gallery-item";
import { useUpdateGalleryItem } from "@/hooks/use-update-gallery-item";
import { GalleryItem } from "@/services/gallery/gallery-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  caption: z.string().max(255, "Legenda deve ter no maximo 255 caracteres").optional().or(z.literal("")),
});

type Schema = z.infer<typeof schema>;

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Falha ao ler arquivo da imagem"));
    };
    reader.onerror = () => reject(new Error("Falha ao ler arquivo da imagem"));
    reader.readAsDataURL(file);
  });
};

interface GalleryItemFormProps {
  listId: string;
  mode?: "create" | "edit";
  galleryItem?: GalleryItem;
  handleSuccessAction?: () => void;
  handleCancelAction?: () => void;
}

export function GalleryItemForm({
  listId,
  mode = "create",
  galleryItem,
  handleSuccessAction,
  handleCancelAction,
}: GalleryItemFormProps) {
  const createGalleryItem = useCreateGalleryItem({ listId });
  const updateGalleryItem = useUpdateGalleryItem({ listId });
  const [previewUrl, setPreviewUrl] = useState<string>(galleryItem?.image_url ?? "");
  const [uploadedImageDataUrl, setUploadedImageDataUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      caption: galleryItem?.caption ?? "",
    },
  });

  const isPending = createGalleryItem.isPending || updateGalleryItem.isPending;

  const handleImageChange = async (file?: File) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFileError("Selecione um arquivo de imagem valido");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError("Imagem muito grande. Use ate 2 MB");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setUploadedImageDataUrl(dataUrl);
      setPreviewUrl(dataUrl);
      setSelectedFileName(file.name);
      setFileError(null);
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Falha ao processar imagem");
    }
  };

  const onSubmit = async ({ caption }: Schema) => {
    const imageUrl = uploadedImageDataUrl || galleryItem?.image_url || "";

    if (!imageUrl) {
      setFileError("Selecione uma imagem para continuar");
      return;
    }

    if (mode === "create") {
      await createGalleryItem.mutateAsync({
        list_id: listId,
        image_url: imageUrl,
        caption: caption?.trim() || "",
      });
    } else if (galleryItem) {
      await updateGalleryItem.mutateAsync({
        list_id: listId,
        gallery_item_id: galleryItem.id,
        image_url: imageUrl,
        caption: caption?.trim() || "",
      });
    }

    handleSuccessAction?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormItem>
          <FormLabel>Imagem</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => {
                void handleImageChange(event.target.files?.[0]);
              }}
              disabled={isPending}
            />
          </FormControl>
          {selectedFileName && (
            <p className="text-xs text-muted-foreground">Arquivo: {selectedFileName}</p>
          )}
          {!selectedFileName && mode === "edit" && galleryItem?.image_url && (
            <p className="text-xs text-muted-foreground">
              Selecione um novo arquivo apenas se quiser trocar a imagem atual.
            </p>
          )}
          {fileError && (
            <p className="text-sm text-red-500">{fileError}</p>
          )}
        </FormItem>
        {previewUrl && (
          <div className="overflow-hidden rounded-md border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview da imagem"
              className="h-48 w-full object-cover"
            />
          </div>
        )}
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Legenda (opcional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex.: Nosso ensaio" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelAction}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-[#b1563c] text-white hover:bg-[#a0452f]"
            disabled={isPending}
          >
            {isPending && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            {mode === "create" ? "Salvar imagem" : "Salvar alteracoes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
