import {NextRequest, NextResponse} from "next/server";
import {sendEmail} from "@/lib/nodemailer/nodemailer";
import {randomBytes} from "crypto";
import {Database} from "@/lib/pg/database";
import {userDao} from "@/daos/user-dao";
import {passwordResetDao} from "@/daos/password-reset-dao";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const db = Database.getInstance();

    await db.transaction(async (client) => {
      const user = await userDao.findUserByEmail(email, client);

      if (!user) {
        return;
      }

      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + Number(process.env.RESET_PASSWORD_TOKEN_EXPIRATION_TIME));

      await passwordResetDao.createPasswordResetToken({userId: user.id, token, expires}, client);

      const resetPasswordUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

      await sendEmail({
        to: `${user.email}`,
        subject: "Alterar senha",
        text: `Clique aqui: ${resetPasswordUrl}`,
        html: `<p>Clique <a href='${resetPasswordUrl}'>aqui</a> para redefinir sua senha</p>`
      });
    });

    return NextResponse.json({ok: true});

  } catch (error){
    return NextResponse.json({error: "Erro ao processar redefinição de senha"}, {status: 500});
  }
}
