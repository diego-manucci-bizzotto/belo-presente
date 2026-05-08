import { NextResponse } from "next/server";
import { ListDAO } from "@/daos/list-dao";
import { GuestDAO } from "@/daos/guest-dao";
import { GuestAttendeeType, GuestStatus } from "@/services/guests/create-guest";
import { resolveListFeatureFlags } from "@/lib/list-feature-flags-resolver";

type CreateRsvpBody = {
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

  if (!flags.attendance_confirmation_enabled) {
    return NextResponse.json({ error: "Confirmacao de presenca desabilitada para esta lista" }, { status: 403 });
  }

  const body: CreateRsvpBody = await req.json();

  const name = normalizeOptionalString(body.name);
  const email = normalizeOptionalString(body.email);
  const phone = normalizeOptionalString(body.phone);
  const note = normalizeOptionalString(body.note);
  const status = body.status;
  const attendeeType = body.attendee_type ?? "adult";
  const companionName = normalizeOptionalString(body.companion_name);
  const hasCompanion = body.has_companion;

  if (!name || name.length > 120) {
    return NextResponse.json({ error: "Nome invalido" }, { status: 400 });
  }

  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: "Email invalido" }, { status: 400 });
  }

  if (phone && phone.length > 30) {
    return NextResponse.json({ error: "Telefone invalido" }, { status: 400 });
  }

  if (note && note.length > 512) {
    return NextResponse.json({ error: "Observacao muito longa" }, { status: 400 });
  }

  if (!isValidStatus(status)) {
    return NextResponse.json({ error: "Status de presenca invalido" }, { status: 400 });
  }

  if (!isValidAttendeeType(attendeeType)) {
    return NextResponse.json({ error: "Tipo de convidado invalido" }, { status: 400 });
  }

  if (hasCompanion !== undefined && typeof hasCompanion !== "boolean") {
    return NextResponse.json({ error: "Informacao de acompanhante invalida" }, { status: 400 });
  }

  if (companionName && companionName.length > 120) {
    return NextResponse.json({ error: "Nome do acompanhante muito longo" }, { status: 400 });
  }

  const resolvedHasCompanion = Boolean(hasCompanion);
  if (resolvedHasCompanion && !companionName) {
    return NextResponse.json({ error: "Nome do acompanhante e obrigatorio" }, { status: 400 });
  }

  try {
    const createdGuest = await GuestDAO.createGuest({
      listId: String(list.id),
      name,
      email,
      phone,
      note,
      status,
      attendee_type: attendeeType,
      has_companion: resolvedHasCompanion,
      companion_name: resolvedHasCompanion ? companionName : undefined,
    });

    return NextResponse.json(createdGuest, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao registrar presenca" }, { status: 500 });
  }
}
