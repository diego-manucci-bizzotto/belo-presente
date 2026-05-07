import { NextResponse } from "next/server";
import { ListDAO } from "@/daos/list-dao";
import { ListContributionDAO } from "@/daos/list-contribution-dao";
import { resolveListFeatureFlags } from "@/lib/list-feature-flags-resolver";

type CreateContributionBody = {
  contributor_name?: unknown;
  contributor_contact?: unknown;
  message?: unknown;
  amount?: unknown;
  currency?: unknown;
};

const normalizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export async function POST(
  req: Request,
  context: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await context.params;

  if (!shareId) {
    return NextResponse.json({ error: "Link da lista invalido" }, { status: 400 });
  }

  const list = await ListDAO.getActiveListByShareId(shareId);

  if (!list) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  const flags = await resolveListFeatureFlags(String(list.id));

  if (!flags.share_enabled) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  if (!flags.contributions_enabled) {
    return NextResponse.json({ error: "Contribuicoes desabilitadas para esta lista" }, { status: 403 });
  }

  const body: CreateContributionBody = await req.json();

  const contributorName = normalizeOptionalString(body.contributor_name);
  const contributorContact = normalizeOptionalString(body.contributor_contact);
  const message = normalizeOptionalString(body.message);
  const currencyRaw = normalizeOptionalString(body.currency) ?? "BRL";
  const amountRaw =
    body.amount === undefined || body.amount === null || body.amount === ""
      ? Number.NaN
      : Number(body.amount);

  if (!contributorName || contributorName.length > 120) {
    return NextResponse.json({ error: "Nome do contribuinte invalido" }, { status: 400 });
  }

  if (contributorContact && contributorContact.length > 255) {
    return NextResponse.json({ error: "Contato invalido" }, { status: 400 });
  }

  if (message && message.length > 512) {
    return NextResponse.json({ error: "Mensagem muito longa" }, { status: 400 });
  }

  if (Number.isNaN(amountRaw) || amountRaw <= 0) {
    return NextResponse.json({ error: "Valor da contribuicao invalido" }, { status: 400 });
  }

  if (!currencyRaw || currencyRaw.length > 10) {
    return NextResponse.json({ error: "Moeda invalida" }, { status: 400 });
  }

  try {
    const contribution = await ListContributionDAO.createContribution({
      listId: String(list.id),
      contributorName,
      contributorContact,
      message,
      amount: amountRaw,
      currency: currencyRaw.toUpperCase(),
      status: "pending",
    });

    return NextResponse.json(contribution, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao registrar contribuicao" }, { status: 500 });
  }
}

