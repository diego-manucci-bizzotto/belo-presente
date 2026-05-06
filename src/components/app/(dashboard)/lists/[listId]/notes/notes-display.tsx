"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { EllipsisVertical, Trash2 } from "lucide-react";
import { GetNotesResponse } from "@/services/notes/get-notes";
import { DeleteNoteAlert } from "@/components/app/(dashboard)/lists/[listId]/notes/delete-note-alert";

interface NotesDisplayProps {
  listId: string;
  notes: GetNotesResponse;
  isLoading: boolean;
}

const formatDateTime = (value: string) => {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export function NotesDisplay({ listId, notes, isLoading }: NotesDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 overflow-y-auto h-full">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-md bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Nenhum recado encontrado.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto h-full">
      {notes.map((note) => (
        <Card key={note.id} className="flex flex-col gap-4 p-4">
          <CardContent className="p-0 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-md font-semibold">{note.author_name}</h3>
                <Badge variant="secondary">Recado</Badge>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <EllipsisVertical />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-42" align="end">
                  <DeleteNoteAlert
                    listId={listId}
                    noteId={note.id}
                    authorName={note.author_name}
                    trigger={(
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 text-red-400 hover:bg-red-100 p-2 transition-colors"
                      >
                        <Trash2 size={20} />
                        Excluir recado
                      </button>
                    )}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-sm text-muted-foreground">{note.message}</p>
            {note.author_contact && (
              <p className="text-xs text-muted-foreground">
                Contato: {note.author_contact}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Enviado em {formatDateTime(note.created_at)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
