import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/next-auth/auth-options";
import {ListDAO} from "@/daos/list-dao";

export async function GET(
  _req: Request,
  context: { params: Promise<{ listId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Nao autorizado" }), { status: 401 });
  }

  const { listId } = await context.params;

  if (!listId) {
    return new Response(JSON.stringify({ error: "Id da lista e obrigatorio" }), { status: 400 });
  }

  try {
    const list = await ListDAO.getListByIdAndUserId(listId, session.user.id.toString());

    if (!list) {
      return new Response(JSON.stringify({ error: "Lista nao encontrada" }), { status: 404 });
    }

    return new Response(JSON.stringify(list), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Erro ao buscar lista" }), { status: 500 });
  }
}
