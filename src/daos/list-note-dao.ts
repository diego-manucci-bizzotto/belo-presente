import { Database } from "@/lib/pg/database";
import { PoolClient } from "pg";

type ListNoteRow = {
  id: string | number;
  list_id: string | number;
  author_name: string;
  author_contact: string | null;
  message: string;
  created_at: string;
  is_active: boolean;
};

type CreateListNoteInput = {
  listId: string;
  authorName: string;
  authorContact?: string;
  message: string;
};

const mapRow = (row: ListNoteRow) => {
  return {
    id: String(row.id),
    list_id: String(row.list_id),
    author_name: row.author_name,
    author_contact: row.author_contact,
    message: row.message,
    created_at: row.created_at,
    is_active: row.is_active,
  };
};

export class ListNoteDAO {
  private constructor() {}

  public static async createNote(
    {
      listId,
      authorName,
      authorContact,
      message,
    }: CreateListNoteInput,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `INSERT INTO list_note (list_id, author_name, author_contact, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, list_id, author_name, author_contact, message, created_at, is_active`,
      [listId, authorName, authorContact ?? null, message]
    );

    return mapRow(rows[0] as ListNoteRow);
  }

  public static async getNotesByListId(listId: string, client?: PoolClient) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT id, list_id, author_name, author_contact, message, created_at, is_active
       FROM list_note
       WHERE list_id = $1 AND is_active = TRUE
       ORDER BY created_at DESC`,
      [listId]
    );

    return rows.map((row) => mapRow(row as ListNoteRow));
  }

  public static async getPublicNotesByShareId(shareId: string, client?: PoolClient) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT
         n.id,
         n.list_id,
         n.author_name,
         n.author_contact,
         n.message,
         n.created_at,
         n.is_active
       FROM list_note n
       JOIN list l ON l.id = n.list_id
       WHERE l.share_id = $1
         AND l.active = TRUE
         AND n.is_active = TRUE
       ORDER BY n.created_at DESC`,
      [shareId]
    );

    return rows.map((row) => mapRow(row as ListNoteRow));
  }

  public static async getNoteByIdAndListId(
    noteId: string,
    listId: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT id, list_id, author_name, author_contact, message, created_at, is_active
       FROM list_note
       WHERE id = $1 AND list_id = $2 AND is_active = TRUE`,
      [noteId, listId]
    );

    if (!rows[0]) {
      return null;
    }

    return mapRow(rows[0] as ListNoteRow);
  }

  public static async deactivateNote(
    noteId: string,
    listId: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const result = await runner.query(
      `UPDATE list_note
       SET is_active = FALSE
       WHERE id = $1 AND list_id = $2 AND is_active = TRUE`,
      [noteId, listId]
    );

    return (result.rowCount ?? 0) > 0;
  }
}
