import {NextResponse} from "next/server";
import {hash} from "bcrypt";
import {pool} from "@/lib/pg/database";

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();

  const client = await pool.connect();

  try {
    const res = await client.query(
      'SELECT "userId", expires, id FROM password_reset WHERE token=$1',
      [token]
    );

    if (res.rows.length === 0 || new Date(res.rows[0].expires) < new Date()) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const userId = res.rows[0].userId;
    const resetId = res.rows[0].id;
    const new_password_hash = await hash(newPassword, 10);

    await client.query('UPDATE users SET password_hash=$1 WHERE id=$2', [new_password_hash, userId]);
    await client.query('DELETE FROM password_reset WHERE id=$1', [resetId]);

    return NextResponse.json({ ok: true });
  } finally {
    client.release();
  }
}
