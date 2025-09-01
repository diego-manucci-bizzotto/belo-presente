import {hash} from "bcrypt";
import {NextRequest} from "next/server";
import {UserDAO} from "@/daos/user-dao";

export async function POST(req: NextRequest) {
  try {
    const {email, password} = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({error: "Email e senha são obrigatórios"}), {status: 400});
    }

    const existingUser = await UserDAO.findUserByEmail(email);

    if (existingUser != null) {
      return new Response(JSON.stringify({ error: "Email já cadastrado" }), { status: 409 });
    }

    const hashedPassword = await hash(password, 10);

    const user = await UserDAO.createUser({email, passwordHash: hashedPassword});

    return new Response(JSON.stringify(user), {status: 201});
  } catch (error) {
    return new Response(JSON.stringify({error: "Erro ao cadastrar usuário"}), {status: 500});
  }
}
