import { Database } from "@/lib/pg/database";
import { PoolClient } from "pg";

export type SelectionEventType = "selected" | "deselected";

type ListSelectionEventRow = {
  id: string | number;
  list_id: string | number;
  product_id: string | number;
  product_name: string;
  guest_name: string;
  event_type: SelectionEventType;
  created_at: string;
};

type CreateSelectionEventInput = {
  listId: string;
  productId: string;
  productName: string;
  guestName: string;
  eventType: SelectionEventType;
};

const mapRow = (row: ListSelectionEventRow) => {
  return {
    id: String(row.id),
    list_id: String(row.list_id),
    product_id: String(row.product_id),
    product_name: row.product_name,
    guest_name: row.guest_name,
    event_type: row.event_type,
    created_at: row.created_at,
  };
};

export class ListSelectionEventDAO {
  private constructor() {}

  public static async createEvent(
    {
      listId,
      productId,
      productName,
      guestName,
      eventType,
    }: CreateSelectionEventInput,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `INSERT INTO list_selection_event (list_id, product_id, product_name, guest_name, event_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, list_id, product_id, product_name, guest_name, event_type, created_at`,
      [listId, productId, productName, guestName, eventType]
    );

    return mapRow(rows[0] as ListSelectionEventRow);
  }

  public static async getEventsByListId(listId: string, client?: PoolClient) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT id, list_id, product_id, product_name, guest_name, event_type, created_at
       FROM list_selection_event
       WHERE list_id = $1
       ORDER BY created_at DESC`,
      [listId]
    );

    return rows.map((row) => mapRow(row as ListSelectionEventRow));
  }
}
