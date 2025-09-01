import { Database } from "@/lib/pg/database";
import { PoolClient } from "pg";

export class UserDAO {
  private constructor() {}

  public static async findUserByEmail(email: string, client?: PoolClient) {
    const db = Database.getInstance();
    const runner = client || db;
    const { rows } = await runner.query(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    );
    return rows[0];
  }

  public static async createUser(
    { email, passwordHash }: { email: string; passwordHash: string },
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;
    const { rows } = await runner.query(
      'INSERT INTO "user" (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, passwordHash]
    );
    return rows[0];
  }

  public static async updateUserPassword(
    userId: string,
    passwordHash: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;
    await runner.query(
      'UPDATE "user" SET password_hash=$1 WHERE id=$2',
      [passwordHash, userId]
    );
  }
}