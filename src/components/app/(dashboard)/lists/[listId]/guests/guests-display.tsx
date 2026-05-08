"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EllipsisVertical, Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { GetGuestsResponse } from "@/services/guests/get-guests";
import { GuestAttendeeType, GuestStatus } from "@/services/guests/create-guest";
import { DeleteGuestAlert } from "@/components/app/(dashboard)/lists/[listId]/guests/delete-guest-alert";
import { EditGuestDialog } from "@/components/app/(dashboard)/lists/[listId]/guests/edit-guest-dialog";

interface GuestsDisplayProps {
  listId: string;
  guests: GetGuestsResponse;
  isLoading: boolean;
}

const statusLabels: Record<GuestStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  declined: "Recusado",
};

const statusStyles: Record<GuestStatus, string> = {
  pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  confirmed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  declined: "bg-rose-100 text-rose-700 hover:bg-rose-100",
};

const attendeeTypeLabels: Record<GuestAttendeeType, string> = {
  adult: "Adulto",
  child: "Crianca",
};

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

export function GuestsDisplay({ listId, guests, isLoading }: GuestsDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 overflow-y-auto h-full">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-md bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (guests.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Nenhum convidado encontrado.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto h-full">
      {guests.map((guest) => (
        <Card key={guest.id} className="flex flex-col gap-4 p-4">
          <CardContent className="p-0 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-md font-semibold">{guest.name}</h3>
                <Badge className={statusStyles[guest.status]}>{statusLabels[guest.status]}</Badge>
                <Badge variant="outline">{attendeeTypeLabels[guest.attendee_type]}</Badge>
                <Badge variant="outline">
                  {guest.has_companion
                    ? `Com acompanhante${guest.companion_name ? `: ${guest.companion_name}` : ""}`
                    : "Sem acompanhante"}
                </Badge>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <EllipsisVertical />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-42" align="end">
                  <div>
                    <EditGuestDialog
                      listId={listId}
                      guest={guest}
                      trigger={(
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors"
                        >
                          <Pencil size={20} />
                          Editar convidado
                        </button>
                      )}
                    />
                    <Separator />
                    <DeleteGuestAlert
                      listId={listId}
                      guestId={guest.id}
                      guestName={guest.name}
                      trigger={(
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 text-red-400 hover:bg-red-100 p-2 transition-colors"
                        >
                          <Trash2 size={20} />
                          Excluir convidado
                        </button>
                      )}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {guest.email ? (
                <p className="flex items-center gap-2">
                  <Mail size={14} />
                  {guest.email}
                </p>
              ) : (
                <p>Email nao informado</p>
              )}
              {guest.phone ? (
                <p className="flex items-center gap-2">
                  <Phone size={14} />
                  {guest.phone}
                </p>
              ) : (
                <p>Telefone nao informado</p>
              )}
              {guest.note ? (
                <p>{guest.note}</p>
              ) : (
                <p>Sem observacoes</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Criado em {formatDateTime(guest.created_at)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
