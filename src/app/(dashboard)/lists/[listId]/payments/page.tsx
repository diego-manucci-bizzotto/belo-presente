"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useGetListFeatures } from "@/hooks/use-get-list-features";
import { useGetContributions } from "@/hooks/use-get-contributions";
import { useGetMonetizationSummary } from "@/hooks/use-get-monetization-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddContributionDialog } from "@/components/app/(dashboard)/lists/[listId]/payments/add-contribution-dialog";
import { ContributionsDisplay } from "@/components/app/(dashboard)/lists/[listId]/payments/contributions-display";
import { FilterActionsToolbar } from "@/components/app/(dashboard)/filter-actions-toolbar";

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

const formatCurrencyBuckets = (values: Array<{ currency: string; amount: number }>) => {
  if (values.length === 0) {
    return "R$ 0,00";
  }

  if (values.length === 1) {
    return formatCurrency(values[0].amount, values[0].currency);
  }

  return `${values.length} moedas`;
};

export default function Page() {
  const [filter, setFilter] = useState("");
  const params = useParams<{ listId: string }>();
  const listId = params.listId;
  const listFeatures = useGetListFeatures({ listId });
  const contributionsEnabled = listFeatures.data?.contributions_enabled === true;
  const contributions = useGetContributions({
    listId,
    enabled: contributionsEnabled,
  });
  const monetizationSummary = useGetMonetizationSummary({ listId });

  const filteredContributions = useMemo(() => {
    if (!contributions.data) {
      return [];
    }

    const normalizedFilter = filter.trim().toLowerCase();
    if (!normalizedFilter) {
      return contributions.data;
    }

    return contributions.data.filter((contribution) => {
      const byName = contribution.contributor_name.toLowerCase().includes(normalizedFilter);
      const byContact = contribution.contributor_contact?.toLowerCase().includes(normalizedFilter) ?? false;
      const byMessage = contribution.message?.toLowerCase().includes(normalizedFilter) ?? false;

      return byName || byContact || byMessage;
    });
  }, [filter, contributions.data]);

  const counters = useMemo(() => {
    const source = contributions.data ?? [];

    const aggregateByCurrency = (items: typeof source) => {
      const buckets = new Map<string, number>();

      for (const item of items) {
        const currency = item.currency || "BRL";
        const current = buckets.get(currency) ?? 0;
        buckets.set(currency, current + item.amount);
      }

      return Array.from(buckets.entries()).map(([currency, amount]) => ({
        currency,
        amount,
      }));
    };

    return {
      total: source.length,
      pending: source.filter((item) => item.status === "pending").length,
      receivedCount: source.filter((item) => item.status === "received").length,
      expectedByCurrency: aggregateByCurrency(source),
      receivedByCurrency: aggregateByCurrency(source.filter((item) => item.status === "received")),
    };
  }, [contributions.data]);

  const monetizationCounters = useMemo(() => {
    const intents = monetizationSummary.data?.intents ?? [];
    const topProducts = monetizationSummary.data?.top_products ?? [];

    const totalIntents = intents.reduce((sum, item) => sum + item.intents_count, 0);
    const cancelledIntents = intents
      .filter((item) => item.status === "cancelled")
      .reduce((sum, item) => sum + item.intents_count, 0);
    const activeIntents = totalIntents - cancelledIntents;

    const redirectIntents = intents
      .filter((item) => item.purchase_type === "redirect")
      .reduce((sum, item) => sum + item.intents_count, 0);
    const qrcodeIntents = intents
      .filter((item) => item.purchase_type === "qrcode")
      .reduce((sum, item) => sum + item.intents_count, 0);

    const amountBucketsMap = new Map<string, number>();

    intents
      .filter((item) => item.status !== "cancelled" && item.total_amount !== null)
      .forEach((item) => {
        const current = amountBucketsMap.get(item.currency) ?? 0;
        amountBucketsMap.set(item.currency, current + (item.total_amount ?? 0));
      });

    const estimatedAmountByCurrency = Array.from(amountBucketsMap.entries()).map(([currency, amount]) => ({
      currency,
      amount,
    }));

    return {
      totalIntents,
      activeIntents,
      cancelledIntents,
      redirectIntents,
      qrcodeIntents,
      estimatedAmountByCurrency,
      topProducts,
    };
  }, [monetizationSummary.data]);

  if (listFeatures.isLoading || listFeatures.isPending) {
    return (
      <div className="w-full flex flex-col gap-4">
        <Skeleton className="h-32 w-full bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {contributionsEnabled ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                <CardTitle className="text-sm text-muted-foreground">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{counters.pending}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Recebidas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{counters.receivedCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Previsto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">{formatCurrencyBuckets(counters.expectedByCurrency)}</p>
                {counters.expectedByCurrency.length > 1 && (
                  <p className="text-xs text-muted-foreground">
                    {counters.expectedByCurrency
                      .map((item) => formatCurrency(item.amount, item.currency))
                      .join(" | ")}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Recebido</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">{formatCurrencyBuckets(counters.receivedByCurrency)}</p>
                {counters.receivedByCurrency.length > 1 && (
                  <p className="text-xs text-muted-foreground">
                    {counters.receivedByCurrency
                      .map((item) => formatCurrency(item.amount, item.currency))
                      .join(" | ")}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <FilterActionsToolbar
            filter={filter}
            placeholder="Filtrar contribuicoes..."
            onFilterChangeAction={setFilter}
            action={<AddContributionDialog listId={listId} />}
          />

          <ContributionsDisplay
            listId={listId}
            contributions={filteredContributions}
            isLoading={contributions.isLoading || contributions.isPending}
          />
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contribuicoes diretas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Contribuicoes estao desabilitadas para esta lista. Ative em Funcionalidades para liberar este fluxo.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monetizacao por presentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {monetizationSummary.isLoading || monetizationSummary.isPending ? (
            <Skeleton className="h-24 w-full bg-gray-200" />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Intencoes totais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{monetizationCounters.totalIntents}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Ativas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{monetizationCounters.activeIntents}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Canceladas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{monetizationCounters.cancelledIntents}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Redirect</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{monetizationCounters.redirectIntents}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">QR code</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{monetizationCounters.qrcodeIntents}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    Volume estimado de intencoes ativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold">
                    {formatCurrencyBuckets(monetizationCounters.estimatedAmountByCurrency)}
                  </p>
                  {monetizationCounters.estimatedAmountByCurrency.length > 1 && (
                    <p className="text-xs text-muted-foreground">
                      {monetizationCounters.estimatedAmountByCurrency
                        .map((item) => formatCurrency(item.amount, item.currency))
                        .join(" | ")}
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Produtos com maior potencial</p>
                {monetizationCounters.topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ainda nao ha intencoes registradas.</p>
                ) : (
                  <div className="space-y-2">
                    {monetizationCounters.topProducts.slice(0, 5).map((item) => (
                      <div
                        key={item.product_id}
                        className="rounded-md border p-3 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.purchase_type === "redirect" ? "Redirect" : "QR code"} - Ativas:{" "}
                            {item.active_intents} - Canceladas: {item.cancelled_intents}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatCurrency(item.estimated_amount, item.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
