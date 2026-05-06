import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth/auth-options";
import { ListDAO } from "@/daos/list-dao";
import { ListNoteDAO } from "@/daos/list-note-dao";
import { resolveListFeatureFlags } from "@/lib/list-feature-flags-resolver";

const getUserIdFromSession = async () => {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? String(session.user.id) : null;
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
  if (!flags.notes_enabled) {
    return NextResponse.json({ error: "Recados desabilitados para esta lista" }, { status: 403 });
  }

  try {
    const notes = await ListNoteDAO.getNotesByListId(listId);
    return NextResponse.json(notes, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar recados" }, { status: 500 });
  }
}
