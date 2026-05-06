"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetListFeatures } from "@/hooks/use-get-list-features";
import { useGetSelectionEvents } from "@/hooks/use-get-selection-events";

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

export default function Page() {
  const [filter, setFilter] = useState("");
  const params = useParams<{ listId: string }>();
  const listId = params.listId;
  const listFeatures = useGetListFeatures({ listId });
  const selectionEvents = useGetSelectionEvents({ listId });

  const filteredEvents = useMemo(() => {
    if (!selectionEvents.data) {
      return [];
    }

    const normalizedFilter = filter.trim().toLowerCase();
    if (!normalizedFilter) {
      return selectionEvents.data;
    }

    return selectionEvents.data.filter((event) => {
      const byGuest = event.guest_name.toLowerCase().includes(normalizedFilter);
      const byProduct = event.product_name.toLowerCase().includes(normalizedFilter);
      const byType = event.event_type.toLowerCase().includes(normalizedFilter);

      return byGuest || byProduct || byType;
    });
  }, [filter, selectionEvents.data]);

  const counters = useMemo(() => {
    const source = selectionEvents.data ?? [];
    return {
      total: source.length,
      selected: source.filter((event) => event.event_type === "selected").length,
      deselected: source.filter((event) => event.event_type === "deselected").length,
    };
  }, [selectionEvents.data]);

  if (
    listFeatures.isLoading ||
    listFeatures.isPending ||
    selectionEvents.isLoading ||
    selectionEvents.isPending
  ) {
    return (
      <div className="w-full flex flex-col gap-4">
        <Skeleton className="h-24 w-full bg-gray-200" />
        <Skeleton className="h-24 w-full bg-gray-200" />
        <Skeleton className="h-80 w-full bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 h-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={listFeatures.data?.selection_notifications_enabled ? "default" : "secondary"}>
              {listFeatures.data?.selection_notifications_enabled ? "Ativo" : "Desativado"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{counters.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Selecionados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{counters.selected}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Desselecionados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{counters.deselected}</p>
          </CardContent>
        </Card>
      </div>

      <Input
        placeholder="Filtrar historico por convidado, produto ou tipo..."
        className="w-full md:max-w-sm"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className="flex flex-col gap-3 overflow-y-auto h-full">
        {filteredEvents.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Nenhum evento de selecao registrado.</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="pt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{event.product_name}</p>
                    <Badge variant={event.event_type === "selected" ? "default" : "secondary"}>
                      {event.event_type === "selected" ? "Selecionado" : "Desselecionado"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDateTime(event.created_at)}</p>
                </div>
                <p className="text-sm text-muted-foreground">Convidado: {event.guest_name}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
