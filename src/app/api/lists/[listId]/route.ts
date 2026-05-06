import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/next-auth/auth-options";
import { ListDAO } from "@/daos/list-dao";

type UpdateListRequestBody = {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  active?: unknown;
};

const normalizeString = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
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

    return NextResponse.json(list, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar lista" }, { status: 500 });
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

  const body: UpdateListRequestBody = await req.json();

  const title = normalizeString(body.title);
  const description = normalizeString(body.description);
  const category = normalizeString(body.category);
  const active = body.active;

  if (!title || title.length > 128) {
    return NextResponse.json(
      { error: "Titulo obrigatorio e com no maximo 128 caracteres" },
      { status: 400 }
    );
  }

  if (description.length > 512) {
    return NextResponse.json(
      { error: "Descricao deve ter no maximo 512 caracteres" },
      { status: 400 }
    );
  }

  if (!category) {
    return NextResponse.json({ error: "Categoria obrigatoria" }, { status: 400 });
  }

  if (typeof active !== "boolean") {
    return NextResponse.json({ error: "Status da lista invalido" }, { status: 400 });
  }

  try {
    const updatedList = await ListDAO.updateListByIdAndUserId({
      listId,
      userId: session.user.id.toString(),
      title,
      description,
      category,
      active,
    });

    if (!updatedList) {
      return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
    }

    return NextResponse.json(updatedList, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar lista" }, { status: 500 });
  }
}
