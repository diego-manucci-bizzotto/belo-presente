"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetListFeatures } from "@/hooks/use-get-list-features";
import { useGetNotes } from "@/hooks/use-get-notes";
import { NotesDisplay } from "@/components/app/(dashboard)/lists/[listId]/notes/notes-display";

export default function Page() {
  const [filter, setFilter] = useState("");
  const params = useParams<{ listId: string }>();
  const listId = params.listId;
  const listFeatures = useGetListFeatures({ listId });
  const notes = useGetNotes({
    listId,
    enabled: listFeatures.data?.notes_enabled === true,
  });

  const filteredNotes = useMemo(() => {
    if (!notes.data) {
      return [];
    }

    const normalizedFilter = filter.trim().toLowerCase();
    if (!normalizedFilter) {
      return notes.data;
    }

    return notes.data.filter((note) => {
      const byAuthor = note.author_name.toLowerCase().includes(normalizedFilter);
      const byMessage = note.message.toLowerCase().includes(normalizedFilter);
      const byContact = note.author_contact?.toLowerCase().includes(normalizedFilter) ?? false;

      return byAuthor || byMessage || byContact;
    });
  }, [filter, notes.data]);

  if (listFeatures.isLoading || listFeatures.isPending) {
    return (
      <div className="w-full flex flex-col gap-4">
        <Skeleton className="h-24 w-full bg-gray-200" />
        <Skeleton className="h-24 w-full bg-gray-200" />
        <Skeleton className="h-64 w-full bg-gray-200" />
      </div>
    );
  }

  if (listFeatures.data && !listFeatures.data.notes_enabled) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">
          Recados estao desabilitados para esta lista. Ative em Funcionalidades.
        </p>
      </div>
    );
  }

  const total = notes.data?.length ?? 0;

  return (
    <div className="w-full flex flex-col gap-4 h-full">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Total de recados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{total}</p>
        </CardContent>
      </Card>

      <Input
        placeholder="Filtrar recados..."
        className="w-full md:max-w-sm"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <NotesDisplay
        listId={listId}
        notes={filteredNotes}
        isLoading={notes.isLoading || notes.isPending}
      />
    </div>
  );
}
