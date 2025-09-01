import { Database } from "@/lib/pg/database";
import { PoolClient } from "pg";

export class PasswordResetDAO {

  private constructor() {}

  public static async createPasswordResetToken({userId, token, expires,}: { userId: string; token: string; expires: Date; }, client?: PoolClient) {
    const db = Database.getInstance();
    const runner = client || db;
    await runner.query(
      "INSERT INTO password_reset(user_id, token, expires) VALUES ($1, $2, $3)",
      [userId, token, expires]
    );
  }

  public static async findPasswordResetTokenByToken(token: string, client?: PoolClient): Promise<{ user_id: string; expires: Date; id: string } | undefined> {
    const db = Database.getInstance();
    const runner = client || db;
    const { rows } = await runner.query(
      "SELECT user_id, expires, id FROM password_reset WHERE token=$1",
      [token]
    );
    return rows[0];
  }

  public static async deletePasswordResetToken(tokenId: string, client?: PoolClient) {
    const db = Database.getInstance();
    const runner = client || db;
    await runner.query("DELETE FROM password_reset WHERE id=$1", [tokenId]);
  }
}