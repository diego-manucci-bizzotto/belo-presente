"use client";

import { ArrowDown, ArrowUp, EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useReorderGalleryItem } from "@/hooks/use-reorder-gallery-item";
import { GetGalleryItemsResponse } from "@/services/gallery/get-gallery-items";
import { DeleteGalleryItemAlert } from "@/components/app/(dashboard)/lists/[listId]/gallery/delete-gallery-item-alert";
import { EditGalleryItemDialog } from "@/components/app/(dashboard)/lists/[listId]/gallery/edit-gallery-item-dialog";

interface GalleryItemsDisplayProps {
  listId: string;
  items: GetGalleryItemsResponse;
  isLoading: boolean;
}

export function GalleryItemsDisplay({ listId, items, isLoading }: GalleryItemsDisplayProps) {
  const reorderGalleryItem = useReorderGalleryItem({ listId });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 overflow-y-auto h-full">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-md bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Nenhuma imagem na galeria.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto h-full">
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <Card key={item.id} className="flex flex-col md:flex-row gap-4 items-start p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.caption || "Imagem da galeria"}
              className="rounded object-cover w-full md:w-36 h-28"
            />
            <CardContent className="p-0 flex flex-col gap-2 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-md font-semibold">
                    {item.caption || "Sem legenda"}
                  </h3>
                  <Badge variant="secondary">Posicao {index + 1}</Badge>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <EllipsisVertical />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-52" align="end">
                    <div>
                      <EditGalleryItemDialog
                        listId={listId}
                        galleryItem={item}
                        trigger={(
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors"
                          >
                            <Pencil size={20} />
                            Editar imagem
                          </button>
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          void reorderGalleryItem.mutateAsync({
                            list_id: listId,
                            gallery_item_id: item.id,
                            direction: "up",
                          });
                        }}
                        disabled={reorderGalleryItem.isPending || isFirst}
                        className="w-full flex items-center gap-2 text-muted-foreground enabled:hover:bg-gray-100 p-2 transition-colors disabled:opacity-50"
                      >
                        <ArrowUp size={20} />
                        Mover para cima
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void reorderGalleryItem.mutateAsync({
                            list_id: listId,
                            gallery_item_id: item.id,
                            direction: "down",
                          });
                        }}
                        disabled={reorderGalleryItem.isPending || isLast}
                        className="w-full flex items-center gap-2 text-muted-foreground enabled:hover:bg-gray-100 p-2 transition-colors disabled:opacity-50"
                      >
                        <ArrowDown size={20} />
                        Mover para baixo
                      </button>
                      <Separator />
                      <DeleteGalleryItemAlert
                        listId={listId}
                        galleryItemId={item.id}
                        trigger={(
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 text-red-400 hover:bg-red-100 p-2 transition-colors"
                          >
                            <Trash2 size={20} />
                            Excluir imagem
                          </button>
                        )}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-xs text-muted-foreground">
                {item.image_url.startsWith("data:image/")
                  ? "Origem: upload direto"
                  : "Origem: link externo"}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
