import {NextResponse} from "next/server";
import {hash} from "bcrypt";
import {Database} from "@/lib/pg/database";
import {passwordResetDao} from "@/daos/password-reset-dao";
import {userDao} from "@/daos/user-dao";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();
    const db = Database.getInstance();

    await db.transaction(async (client) => {
      const passwordResetToken = await passwordResetDao.findPasswordResetTokenByToken(token, client);

      if (!passwordResetToken || new Date(passwordResetToken.expires) < new Date()) {
        return NextResponse.json({ ok: false }, { status: 400 });
      }

      const {id, user_id: userId} = passwordResetToken;
      const newPasswordHash = await hash(newPassword, 10);

      await userDao.updateUserPassword(userId, newPasswordHash, client);
      await passwordResetDao.deletePasswordResetToken(id, client);
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({error: "Erro ao processar redefinição de senha"}, { status: 500 });
  }
}
