import {NextRequest} from "next/server";
import {pool} from "@/lib/pg/database";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/next-auth/auth-options";
import {nanoid} from "nanoid";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 });
  }

  try {
    const result = await pool.query(
      `SELECT id, title, description, category, user_id, share_id, active FROM lists WHERE user_id = $1`,
      [session.user.id]
    );

    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Erro ao buscar listas" }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 });
  }

  const {title, description, category} = await req.json();

  if (!title || !category) {
    return new Response(JSON.stringify({error: "Título e categoria são obrigatórios"}), {status: 400});
  }

  try {
    const sharedId = nanoid(8);

    const result = await pool.query(
      `INSERT INTO lists (title, description, category, user_id, share_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, category, session.user.id, sharedId]
    );

    return new Response(JSON.stringify(result.rows[0]), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({error: "Erro ao criar lista"}), {status: 500});
  }
}