import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth/auth-options";
import { ListDAO } from "@/daos/list-dao";
import { GuestDAO } from "@/daos/guest-dao";
import { GuestAttendeeType, GuestStatus } from "@/services/guests/create-guest";
import { resolveListFeatureFlags } from "@/lib/list-feature-flags-resolver";

type GuestRequestBody = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  note?: unknown;
  status?: unknown;
  attendee_type?: unknown;
  has_companion?: unknown;
  companion_name?: unknown;
};

const isValidStatus = (value: unknown): value is GuestStatus => {
  return value === "pending" || value === "confirmed" || value === "declined";
};

const isValidAttendeeType = (value: unknown): value is GuestAttendeeType => {
  return value === "adult" || value === "child";
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
  const attendeeType = body.attendee_type ?? "adult";
  const companionName = normalizeOptionalString(body.companion_name);
  const hasCompanion = body.has_companion;

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

  if (!isValidAttendeeType(attendeeType)) {
    return { error: "Tipo de convidado invalido", status: 400 as const };
  }

  if (hasCompanion !== undefined && typeof hasCompanion !== "boolean") {
    return { error: "Informacao de acompanhante invalida", status: 400 as const };
  }

  if (companionName && companionName.length > 120) {
    return { error: "Nome do acompanhante deve ter no maximo 120 caracteres", status: 400 as const };
  }

  const resolvedHasCompanion = Boolean(hasCompanion);
  if (resolvedHasCompanion && !companionName) {
    return { error: "Nome do acompanhante e obrigatorio", status: 400 as const };
  }

  return {
    name,
    email,
    phone,
    note,
    status,
    attendee_type: attendeeType,
    has_companion: resolvedHasCompanion,
    companion_name: resolvedHasCompanion ? companionName : undefined,
  };
};

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ listId: string; guestId: string }> }
) {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { listId, guestId } = await context.params;
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

  const existingGuest = await GuestDAO.getGuestByIdAndListId(guestId, listId);
  if (!existingGuest) {
    return NextResponse.json({ error: "Convidado nao encontrado" }, { status: 404 });
  }

  const body: GuestRequestBody = await req.json();
  const validatedPayload = validateGuestPayload(body);

  if ("error" in validatedPayload) {
    return NextResponse.json({ error: validatedPayload.error }, { status: 400 });
  }

  try {
    const updatedGuest = await GuestDAO.updateGuest({
      guestId,
      listId,
      name: validatedPayload.name,
      email: validatedPayload.email,
      phone: validatedPayload.phone,
      note: validatedPayload.note,
      status: validatedPayload.status,
      attendee_type: validatedPayload.attendee_type,
      has_companion: validatedPayload.has_companion,
      companion_name: validatedPayload.companion_name,
    });

    if (!updatedGuest) {
      return NextResponse.json({ error: "Convidado nao encontrado" }, { status: 404 });
    }

    return NextResponse.json(updatedGuest, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar convidado" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ listId: string; guestId: string }> }
) {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { listId, guestId } = await context.params;
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
    const deleted = await GuestDAO.deactivateGuest(guestId, listId);

    if (!deleted) {
      return NextResponse.json({ error: "Convidado nao encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir convidado" }, { status: 500 });
  }
}
