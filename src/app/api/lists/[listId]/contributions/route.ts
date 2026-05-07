import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth/auth-options";
import { ListDAO } from "@/daos/list-dao";
import { ListContributionDAO, ListContributionStatus } from "@/daos/list-contribution-dao";
import { resolveListFeatureFlags } from "@/lib/list-feature-flags-resolver";

type ContributionRequestBody = {
  contributor_name?: unknown;
  contributor_contact?: unknown;
  message?: unknown;
  amount?: unknown;
  currency?: unknown;
  status?: unknown;
};

const normalizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const isValidStatus = (value: unknown): value is ListContributionStatus => {
  return value === "pending" || value === "received" || value === "cancelled";
};

const getUserIdFromSession = async () => {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? String(session.user.id) : null;
};

const validatePayload = (body: ContributionRequestBody) => {
  const contributorName = normalizeOptionalString(body.contributor_name);
  const contributorContact = normalizeOptionalString(body.contributor_contact);
  const message = normalizeOptionalString(body.message);
  const currencyRaw = normalizeOptionalString(body.currency) ?? "BRL";
  const statusRaw = body.status ?? "pending";
  const amountRaw =
    body.amount === undefined || body.amount === null || body.amount === ""
      ? Number.NaN
      : Number(body.amount);

  if (!contributorName) {
    return { error: "Nome do contribuinte e obrigatorio", status: 400 as const };
  }

  if (contributorName.length > 120) {
    return { error: "Nome deve ter no maximo 120 caracteres", status: 400 as const };
  }

  if (contributorContact && contributorContact.length > 255) {
    return { error: "Contato deve ter no maximo 255 caracteres", status: 400 as const };
  }

  if (message && message.length > 512) {
    return { error: "Mensagem deve ter no maximo 512 caracteres", status: 400 as const };
  }

  if (Number.isNaN(amountRaw) || amountRaw <= 0) {
    return { error: "Valor da contribuicao invalido", status: 400 as const };
  }

  if (!currencyRaw || currencyRaw.length > 10) {
    return { error: "Moeda invalida", status: 400 as const };
  }

  if (!isValidStatus(statusRaw)) {
    return { error: "Status da contribuicao invalido", status: 400 as const };
  }

  return {
    contributorName,
    contributorContact,
    message,
    amount: amountRaw,
    currency: currencyRaw.toUpperCase(),
    contributionStatus: statusRaw,
  };
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ listId: string }> }
) {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { listId } = await context.params;
  const list = await ListDAO.getListByIdAndUserId(listId, userId);

  if (!list) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  const flags = await resolveListFeatureFlags(listId);
  if (!flags.contributions_enabled) {
    return NextResponse.json({ error: "Contribuicoes desabilitadas para esta lista" }, { status: 403 });
  }

  try {
    const contributions = await ListContributionDAO.getContributionsByListId(listId);
    return NextResponse.json(contributions, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar contribuicoes" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ listId: string }> }
) {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { listId } = await context.params;
  const list = await ListDAO.getListByIdAndUserId(listId, userId);

  if (!list) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  const flags = await resolveListFeatureFlags(listId);
  if (!flags.contributions_enabled) {
    return NextResponse.json({ error: "Contribuicoes desabilitadas para esta lista" }, { status: 403 });
  }

  const body: ContributionRequestBody = await req.json();
  const validatedPayload = validatePayload(body);

  if ("error" in validatedPayload) {
    return NextResponse.json({ error: validatedPayload.error }, { status: validatedPayload.status });
  }

  try {
    const createdContribution = await ListContributionDAO.createContribution({
      listId,
      contributorName: validatedPayload.contributorName,
      contributorContact: validatedPayload.contributorContact,
      message: validatedPayload.message,
      amount: validatedPayload.amount,
      currency: validatedPayload.currency,
      status: validatedPayload.contributionStatus,
    });

    return NextResponse.json(createdContribution, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar contribuicao" }, { status: 500 });
  }
}
