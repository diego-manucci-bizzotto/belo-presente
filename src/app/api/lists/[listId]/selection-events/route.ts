import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth/auth-options";
import { ListDAO } from "@/daos/list-dao";
import { ListSelectionEventDAO } from "@/daos/list-selection-event-dao";
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
  if (!flags.selection_notifications_enabled) {
    return NextResponse.json(
      { error: "Notificacoes de selecao desabilitadas para esta lista" },
      { status: 403 }
    );
  }

  const emailConfigured =
    Boolean(process.env.SMTP_HOST) &&
    Boolean(process.env.SMTP_PORT) &&
    Boolean(process.env.SMTP_USER) &&
    Boolean(process.env.SMTP_PASS) &&
    Boolean(process.env.SMTP_FROM_EMAIL);

  try {
    const events = await ListSelectionEventDAO.getEventsByListId(listId);
    return NextResponse.json(
      {
        events,
        channels: {
          email_configured: emailConfigured,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Erro ao buscar historico de selecao" }, { status: 500 });
  }
}
