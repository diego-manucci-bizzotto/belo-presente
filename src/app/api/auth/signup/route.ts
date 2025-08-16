import { hash } from "bcrypt";
import {pool} from "@/lib/pg/database";
import {NextRequest} from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {email, password} = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({error: "Email e senha são obrigatórios"}), {status: 400});
    }

    const hashedPassword = await hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    return new Response(JSON.stringify(result.rows[0]), {status: 201});
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return new Response(JSON.stringify({error: "Email já cadastrado"}), {status: 409});
    }
    return new Response(JSON.stringify({error: "Erro ao cadastrar usuário"}), {status: 500});
  }
}
