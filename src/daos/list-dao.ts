import { Database } from "@/lib/pg/database";
import { PoolClient } from "pg";

export class ListDAO {
  private constructor() {}

  public static async getListsByUserId(userId: string, client?: PoolClient) {
    const db = Database.getInstance();
    const runner = client || db;
    const { rows } = await runner.query(
      "SELECT id, title, description, category, user_id, share_id, active FROM list WHERE user_id = $1",
      [userId]
    );
    return rows;
  }

  public static async createList(
    {
      title,
      description,
      category,
      userId,
      sharedId,
    }: {
      title: string;
      description: string;
      category: string;
      userId: string;
      sharedId: string;
    },
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;
    const { rows } = await runner.query(
      "INSERT INTO list (title, description, category, user_id, share_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, category, userId, sharedId]
    );
    return rows[0];
  }

  public static async getListByIdAndUserId(
    listId: string,
    userId: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;
    const { rows } = await runner.query(
      "SELECT id, title, description, category, user_id, share_id, active FROM list WHERE id = $1 AND user_id = $2",
      [listId, userId]
    );
    return rows[0];
  }
}