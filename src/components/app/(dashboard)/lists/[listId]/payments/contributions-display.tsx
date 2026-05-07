"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { GetContributionsResponse } from "@/services/contributions/get-contributions";
import { ContributionStatus } from "@/services/contributions/contribution-types";
import { DeleteContributionAlert } from "@/components/app/(dashboard)/lists/[listId]/payments/delete-contribution-alert";
import { EditContributionDialog } from "@/components/app/(dashboard)/lists/[listId]/payments/edit-contribution-dialog";

interface ContributionsDisplayProps {
  listId: string;
  contributions: GetContributionsResponse;
  isLoading: boolean;
}

const statusLabels: Record<ContributionStatus, string> = {
  pending: "Pendente",
  received: "Recebida",
  cancelled: "Cancelada",
};

const statusStyles: Record<ContributionStatus, string> = {
  pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  received: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  cancelled: "bg-rose-100 text-rose-700 hover:bg-rose-100",
};

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
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

export function ContributionsDisplay({
  listId,
  contributions,
  isLoading,
}: ContributionsDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 overflow-y-auto h-full">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-md bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Nenhuma contribuicao encontrada.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto h-full">
      {contributions.map((contribution) => (
        <Card key={contribution.id} className="flex flex-col gap-4 p-4">
          <CardContent className="p-0 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-md font-semibold">{contribution.contributor_name}</h3>
                <Badge className={statusStyles[contribution.status]}>
                  {statusLabels[contribution.status]}
                </Badge>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <EllipsisVertical />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-48" align="end">
                  <div>
                    <EditContributionDialog
                      listId={listId}
                      contribution={contribution}
                      trigger={(
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 text-muted-foreground hover:bg-gray-100 p-2 transition-colors"
                        >
                          <Pencil size={20} />
                          Editar contribuicao
                        </button>
                      )}
                    />
                    <Separator />
                    <DeleteContributionAlert
                      listId={listId}
                      contributionId={contribution.id}
                      contributorName={contribution.contributor_name}
                      trigger={(
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 text-red-400 hover:bg-red-100 p-2 transition-colors"
                        >
                          <Trash2 size={20} />
                          Excluir contribuicao
                        </button>
                      )}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-sm font-medium">
              {formatCurrency(contribution.amount, contribution.currency)}
            </p>
            {contribution.contributor_contact && (
              <p className="text-sm text-muted-foreground">
                Contato: {contribution.contributor_contact}
              </p>
            )}
            {contribution.message ? (
              <p className="text-sm text-muted-foreground">{contribution.message}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Sem mensagem</p>
            )}
            <p className="text-xs text-muted-foreground">
              Registrada em {formatDateTime(contribution.created_at)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

