import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth/auth-options";
import { ListDAO } from "@/daos/list-dao";
import { GiftIntentDAO } from "@/daos/gift-intent-dao";

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

  try {
    const snapshot = await GiftIntentDAO.getMonetizationSnapshotByListId(listId);
    return NextResponse.json(snapshot, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar metricas de monetizacao" }, { status: 500 });
  }
}

