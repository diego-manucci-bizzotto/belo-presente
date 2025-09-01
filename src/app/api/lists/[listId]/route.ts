import {NextRequest} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/next-auth/auth-options";
import {ListDAO} from "@/daos/list-dao";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ listId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 });
  }

  const { listId } = await context.params;

  if (!listId) {
    return new Response(JSON.stringify({ error: "Id da lista é obrigatório" }), { status: 400 });
  }

  try {
    const list = await ListDAO.getListByIdAndUserId(listId, session.user.id.toString());

    if (!list) {
      return new Response(JSON.stringify({ error: "Lista não encontrada" }), { status: 404 });
    }

    return new Response(JSON.stringify(list), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Erro ao buscar lista" }), { status: 500 });
  }
}