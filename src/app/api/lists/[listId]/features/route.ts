import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/next-auth/auth-options";
import { ListDAO } from "@/daos/list-dao";
import { ListFeatureFlagsDAO } from "@/daos/list-feature-flags-dao";
import { DEFAULT_LIST_FEATURE_FLAGS } from "@/lib/list-feature-flags";

type UpdateListFeaturesRequestBody = {
  attendance_confirmation_enabled?: unknown;
  notes_enabled?: unknown;
  contributions_enabled?: unknown;
  share_enabled?: unknown;
  selection_notifications_enabled?: unknown;
};

const isBoolean = (value: unknown): value is boolean => {
  return typeof value === "boolean";
};

export async function GET(
  _req: Request,
  context: { params: Promise<{ listId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { listId } = await context.params;
  if (!listId) {
    return NextResponse.json({ error: "Id da lista e obrigatorio" }, { status: 400 });
  }

  try {
    const list = await ListDAO.getListByIdAndUserId(listId, session.user.id.toString());
    if (!list) {
      return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
    }

    const flags = await ListFeatureFlagsDAO.getByListId(listId);

    if (!flags) {
      return NextResponse.json(
        {
          list_id: String(list.id),
          ...DEFAULT_LIST_FEATURE_FLAGS,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(flags, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar funcionalidades da lista" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ listId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { listId } = await context.params;
  if (!listId) {
    return NextResponse.json({ error: "Id da lista e obrigatorio" }, { status: 400 });
  }

  const body: UpdateListFeaturesRequestBody = await req.json();

  if (
    !isBoolean(body.attendance_confirmation_enabled) ||
    !isBoolean(body.notes_enabled) ||
    !isBoolean(body.contributions_enabled) ||
    !isBoolean(body.share_enabled) ||
    !isBoolean(body.selection_notifications_enabled)
  ) {
    return NextResponse.json({ error: "Flags de funcionalidades invalidas" }, { status: 400 });
  }

  try {
    const list = await ListDAO.getListByIdAndUserId(listId, session.user.id.toString());
    if (!list) {
      return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
    }

    const updatedFlags = await ListFeatureFlagsDAO.upsertByListId({
      listId,
      attendanceConfirmationEnabled: body.attendance_confirmation_enabled,
      notesEnabled: body.notes_enabled,
      contributionsEnabled: body.contributions_enabled,
      shareEnabled: body.share_enabled,
      selectionNotificationsEnabled: body.selection_notifications_enabled,
    });

    return NextResponse.json(updatedFlags, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar funcionalidades da lista" }, { status: 500 });
  }
}
