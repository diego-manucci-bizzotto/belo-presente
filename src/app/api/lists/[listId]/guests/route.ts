import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth/auth-options";
import { ListDAO } from "@/daos/list-dao";
import { GuestDAO } from "@/daos/guest-dao";
import { GuestStatus } from "@/services/guests/create-guest";
import { resolveListFeatureFlags } from "@/lib/list-feature-flags-resolver";

type GuestRequestBody = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  note?: unknown;
  status?: unknown;
};

const isValidStatus = (value: unknown): value is GuestStatus => {
  return value === "pending" || value === "confirmed" || value === "declined";
};

const normalizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const getUserIdFromSession = async () => {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? String(session.user.id) : null;
};

const validateGuestPayload = (body: GuestRequestBody) => {
  const name = normalizeOptionalString(body.name);
  const email = normalizeOptionalString(body.email);
  const phone = normalizeOptionalString(body.phone);
  const note = normalizeOptionalString(body.note);
  const status = body.status;

  if (!name) {
    return { error: "Nome do convidado e obrigatorio", status: 400 as const };
  }

  if (name.length > 120) {
    return { error: "Nome do convidado deve ter no maximo 120 caracteres", status: 400 as const };
  }

  if (email && !isValidEmail(email)) {
    return { error: "Email invalido", status: 400 as const };
  }

  if (phone && phone.length > 30) {
    return { error: "Telefone invalido", status: 400 as const };
  }

  if (note && note.length > 512) {
    return { error: "Observacao deve ter no maximo 512 caracteres", status: 400 as const };
  }

  if (!isValidStatus(status)) {
    return { error: "Status do convidado invalido", status: 400 as const };
  }

  return {
    name,
    email,
    phone,
    note,
    status,
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
  if (!flags.attendance_confirmation_enabled) {
    return NextResponse.json(
      { error: "Confirmacao de presenca desabilitada para esta lista" },
      { status: 403 }
    );
  }

  try {
    const guests = await GuestDAO.getGuestsByListId(listId);
    return NextResponse.json(guests, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar convidados" }, { status: 500 });
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
  if (!flags.attendance_confirmation_enabled) {
    return NextResponse.json(
      { error: "Confirmacao de presenca desabilitada para esta lista" },
      { status: 403 }
    );
  }

  const body: GuestRequestBody = await req.json();
  const validatedPayload = validateGuestPayload(body);

  if ("error" in validatedPayload) {
    return NextResponse.json({ error: validatedPayload.error }, { status: 400 });
  }

  try {
    const createdGuest = await GuestDAO.createGuest({
      listId,
      name: validatedPayload.name,
      email: validatedPayload.email,
      phone: validatedPayload.phone,
      note: validatedPayload.note,
      status: validatedPayload.status,
    });

    return NextResponse.json(createdGuest, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar convidado" }, { status: 500 });
  }
}
