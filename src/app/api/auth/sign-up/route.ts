import { hash } from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { UserDAO } from "@/daos/user-dao";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }

    const existingUser = await UserDAO.findUserByEmail(email);

    if (existingUser) {
      if (existingUser.password_hash) {
        return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
      }

      const hashedPassword = await hash(password, 10);
      await UserDAO.updateUserPassword(String(existingUser.id), hashedPassword);

      return NextResponse.json({id: String(existingUser.id), email: existingUser.email}, { status: 200 });
    }

    const hashedPassword = await hash(password, 10);
    const user = await UserDAO.createUser({ email, passwordHash: hashedPassword });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao cadastrar usuário" }, { status: 500 });
  }
}