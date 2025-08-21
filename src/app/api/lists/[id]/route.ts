import { NextRequest } from "next/server";
import { pool } from "@/lib/pg/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth/auth-options";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 });
  }

  const { id: listId } = await context.params;

  if (!listId) {
    return new Response(JSON.stringify({ error: "ID da lista é obrigatório" }), { status: 400 });
  }

  try {
    const result = await pool.query(
      `SELECT id, title, description, category, user_id, share_id, active FROM lists WHERE id = $1 AND user_id = $2`,
      [listId, session.user.id]
    );

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: "Lista não encontrada" }), { status: 404 });
    }

    return new Response(JSON.stringify(result.rows[0]), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Erro ao buscar lista" }), { status: 500 });
  }
}