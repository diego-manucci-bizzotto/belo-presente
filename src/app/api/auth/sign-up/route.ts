import { hash } from "bcrypt";
import {pool} from "@/lib/pg/database";
import {NextRequest} from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {email, password} = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({error: "Email e senha são obrigatórios"}), {status: 400});
    }

    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rowCount != null && existingUser.rowCount > 0) {
      return new Response(JSON.stringify({ error: "Email já cadastrado" }), { status: 409 });
    }

    const hashedPassword = await hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    return new Response(JSON.stringify(result.rows[0]), {status: 201});
  } catch (error) {
    return new Response(JSON.stringify({error: "Erro ao cadastrar usuário"}), {status: 500});
  }
}
