"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddGuestDialog } from "@/components/app/(dashboard)/lists/[listId]/guests/add-guest-dialog";
import { GuestsDisplay } from "@/components/app/(dashboard)/lists/[listId]/guests/guests-display";
import { useGetGuests } from "@/hooks/use-get-guests";
import { useGetListFeatures } from "@/hooks/use-get-list-features";

const STATUS_LABELS = {
  pending: "Pendentes",
  confirmed: "Confirmados",
  declined: "Recusados",
} as const;

export default function Page() {
  const [filter, setFilter] = useState("");
  const params = useParams<{ listId: string }>();
  const listId = params.listId;
  const listFeatures = useGetListFeatures({ listId });
  const guests = useGetGuests({
    listId,
    enabled: listFeatures.data?.attendance_confirmation_enabled === true,
  });

  const counters = useMemo(() => {
    const source = guests.data ?? [];
    return {
      total: source.length,
      pending: source.filter((guest) => guest.status === "pending").length,
      confirmed: source.filter((guest) => guest.status === "confirmed").length,
      declined: source.filter((guest) => guest.status === "declined").length,
    };
  }, [guests.data]);

  const filteredGuests = useMemo(() => {
    if (!guests.data) {
      return [];
    }

    const normalizedFilter = filter.trim().toLowerCase();
    if (!normalizedFilter) {
      return guests.data;
    }

    return guests.data.filter((guest) => {
      const byName = guest.name.toLowerCase().includes(normalizedFilter);
      const byEmail = guest.email?.toLowerCase().includes(normalizedFilter) ?? false;
      const byPhone = guest.phone?.toLowerCase().includes(normalizedFilter) ?? false;

      return byName || byEmail || byPhone;
    });
  }, [filter, guests.data]);

  if (listFeatures.isLoading || listFeatures.isPending) {
    return (
      <div className="w-full flex flex-col gap-4">
        <Skeleton className="h-24 w-full bg-gray-200" />
        <Skeleton className="h-24 w-full bg-gray-200" />
        <Skeleton className="h-64 w-full bg-gray-200" />
      </div>
    );
  }

  if (listFeatures.data && !listFeatures.data.attendance_confirmation_enabled) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">
          A confirmacao de presenca esta desativada para esta lista. Ative em Funcionalidades.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 h-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            <CardTitle className="text-sm text-muted-foreground">{STATUS_LABELS.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{counters.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{STATUS_LABELS.confirmed}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{counters.confirmed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{STATUS_LABELS.declined}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{counters.declined}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center gap-4">
        <Input
          placeholder="Filtrar convidados..."
          className="w-full md:max-w-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <AddGuestDialog listId={listId} />
      </div>

      <GuestsDisplay
        listId={listId}
        guests={filteredGuests}
        isLoading={guests.isLoading || guests.isPending}
      />
    </div>
  );
}
