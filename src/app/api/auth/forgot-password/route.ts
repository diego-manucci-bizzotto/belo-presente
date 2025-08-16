import {NextResponse} from "next/server";
import {sendEmail} from "@/lib/nodemailer/nodemailer";
import {pool} from "@/lib/pg/database";
import {randomBytes} from "crypto";

interface UserResponse {
  id: number,
  email: string
}

export async function POST(req: Request) {
  const { email } = await req.json();

  const client = await pool.connect();

  try {
    const userResponse = await client.query<UserResponse>('SELECT id, email FROM users WHERE email=$1', [email]);
    if (userResponse.rows.length === 0) {
      return NextResponse.json({ok: true});
    }

    const user = userResponse.rows[0];

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + Number(process.env.RESET_PASSWORD_TOKEN_EXPIRATION_TIME));

    await client.query(
      'INSERT INTO password_reset("userId", token, expires) VALUES ($1, $2, $3)',
      [user.id, token, expires]
    );

    const resetPasswordUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: `${user.email}`,
      subject: "Alterar senha",
      text: `Clique aqui: ${resetPasswordUrl}`,
      html: `<p>Clique <a href='${resetPasswordUrl}'>aqui</a> para redefinir sua senha</p>`
    });

    return NextResponse.json({ ok: true });
  } finally {
    client.release();
  }
}
