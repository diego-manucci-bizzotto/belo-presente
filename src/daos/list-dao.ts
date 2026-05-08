import { Database } from "@/lib/pg/database";
import { ListBackgroundTheme } from "@/lib/list-background-theme";
import { PoolClient } from "pg";

export class ListDAO {
  private constructor() {}

  public static async getListsByUserId(userId: string, client?: PoolClient) {
    const db = Database.getInstance();
    const runner = client || db;
    const { rows } = await runner.query(
      "SELECT id, title, description, category, user_id, share_id, active, background_theme FROM list WHERE user_id = $1",
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
      "SELECT id, title, description, category, user_id, share_id, active, background_theme FROM list WHERE id = $1 AND user_id = $2",
      [listId, userId]
    );
    return rows[0];
  }

  public static async getActiveListByShareId(
    shareId: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;
    const { rows } = await runner.query(
      `SELECT id, title, description, category, user_id, share_id, active, background_theme
       FROM list
       WHERE share_id = $1 AND active = TRUE`,
      [shareId]
    );

    return rows[0] ?? null;
  }

  public static async updateListByIdAndUserId(
    {
      listId,
      userId,
      title,
      description,
      category,
      active,
      backgroundTheme,
    }: {
      listId: string;
      userId: string;
      title: string;
      description?: string;
      category: string;
      active: boolean;
      backgroundTheme?: ListBackgroundTheme | null;
    },
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;
    const { rows } = await runner.query(
      `UPDATE list
       SET title = $3,
           description = $4,
           category = $5,
           active = $6,
           background_theme = COALESCE($7, background_theme)
       WHERE id = $1 AND user_id = $2
       RETURNING id, title, description, category, user_id, share_id, active, background_theme`,
      [listId, userId, title, description ?? "", category, active, backgroundTheme ?? null]
    );

    return rows[0] ?? null;
  }
}
