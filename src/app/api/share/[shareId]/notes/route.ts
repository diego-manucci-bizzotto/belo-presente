import { NextResponse } from "next/server";
import { ListDAO } from "@/daos/list-dao";
import { ListNoteDAO } from "@/daos/list-note-dao";
import { resolveListFeatureFlags } from "@/lib/list-feature-flags-resolver";

type CreateSharedNoteBody = {
  author_name?: unknown;
  author_contact?: unknown;
  message?: unknown;
};

const normalizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export async function GET(
  _req: Request,
  context: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await context.params;

  if (!shareId) {
    return NextResponse.json({ error: "Link de compartilhamento invalido" }, { status: 400 });
  }

  try {
    const list = await ListDAO.getActiveListByShareId(shareId);

    if (!list) {
      return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
    }

    const flags = await resolveListFeatureFlags(String(list.id));

    if (!flags.share_enabled) {
      return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
    }

    if (!flags.notes_enabled) {
      return NextResponse.json({ error: "Recados desabilitados para esta lista" }, { status: 403 });
    }

    const notes = await ListNoteDAO.getPublicNotesByShareId(shareId);
    return NextResponse.json(notes, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar recados da lista publica" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await context.params;

  if (!shareId) {
    return NextResponse.json({ error: "Link de compartilhamento invalido" }, { status: 400 });
  }

  const list = await ListDAO.getActiveListByShareId(shareId);
  if (!list) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  const flags = await resolveListFeatureFlags(String(list.id));

  if (!flags.share_enabled) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  if (!flags.notes_enabled) {
    return NextResponse.json({ error: "Recados desabilitados para esta lista" }, { status: 403 });
  }

  const body: CreateSharedNoteBody = await req.json();
  const authorName = normalizeOptionalString(body.author_name);
  const authorContact = normalizeOptionalString(body.author_contact);
  const message = normalizeOptionalString(body.message);

  if (!authorName || authorName.length > 120) {
    return NextResponse.json({ error: "Nome invalido" }, { status: 400 });
  }

  if (authorContact && authorContact.length > 255) {
    return NextResponse.json({ error: "Contato invalido" }, { status: 400 });
  }

  if (!message || message.length > 512) {
    return NextResponse.json({ error: "Recado invalido" }, { status: 400 });
  }

  try {
    const createdNote = await ListNoteDAO.createNote({
      listId: String(list.id),
      authorName,
      authorContact,
      message,
    });

    return NextResponse.json(createdNote, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao enviar recado" }, { status: 500 });
  }
}
