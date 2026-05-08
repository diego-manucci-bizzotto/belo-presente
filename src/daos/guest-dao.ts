import { Database } from "@/lib/pg/database";
import { PoolClient } from "pg";
import { GuestAttendeeType, GuestStatus } from "@/services/guests/create-guest";

type GuestRow = {
  id: string | number;
  list_id: string | number;
  name: string;
  email: string | null;
  phone: string | null;
  note: string | null;
  status: GuestStatus;
  attendee_type: GuestAttendeeType;
  has_companion: boolean;
  companion_name: string | null;
  created_at: string;
  is_active: boolean;
};

type CreateGuestInput = {
  listId: string;
  name: string;
  email?: string;
  phone?: string;
  note?: string;
  status: GuestStatus;
  attendee_type?: GuestAttendeeType;
  has_companion?: boolean;
  companion_name?: string;
};

type UpdateGuestInput = CreateGuestInput & {
  guestId: string;
};

const mapGuestRow = (row: GuestRow) => {
  return {
    id: String(row.id),
    list_id: String(row.list_id),
    name: row.name,
    email: row.email,
    phone: row.phone,
    note: row.note,
    status: row.status,
    attendee_type: row.attendee_type,
    has_companion: row.has_companion,
    companion_name: row.companion_name,
    created_at: row.created_at,
    is_active: row.is_active,
  };
};

export class GuestDAO {
  private constructor() {}

  public static async createGuest(
    {
      listId,
      name,
      email,
      phone,
      note,
      status,
      attendee_type,
      has_companion,
      companion_name,
    }: CreateGuestInput,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `INSERT INTO guest (list_id, name, email, phone, note, status, attendee_type, has_companion, companion_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, list_id, name, email, phone, note, status, attendee_type, has_companion, companion_name, created_at, is_active`,
      [
        listId,
        name,
        email ?? null,
        phone ?? null,
        note ?? null,
        status,
        attendee_type ?? "adult",
        has_companion ?? false,
        has_companion ? companion_name ?? null : null,
      ]
    );

    return mapGuestRow(rows[0] as GuestRow);
  }

  public static async getGuestsByListId(listId: string, client?: PoolClient) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT id, list_id, name, email, phone, note, status, attendee_type, has_companion, companion_name, created_at, is_active
       FROM guest
       WHERE list_id = $1 AND is_active = TRUE
       ORDER BY created_at DESC`,
      [listId]
    );

    return rows.map((row) => mapGuestRow(row as GuestRow));
  }

  public static async getGuestByIdAndListId(
    guestId: string,
    listId: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT id, list_id, name, email, phone, note, status, attendee_type, has_companion, companion_name, created_at, is_active
       FROM guest
       WHERE id = $1 AND list_id = $2 AND is_active = TRUE`,
      [guestId, listId]
    );

    if (!rows[0]) {
      return null;
    }

    return mapGuestRow(rows[0] as GuestRow);
  }

  public static async updateGuest(
    {
      guestId,
      listId,
      name,
      email,
      phone,
      note,
      status,
      attendee_type,
      has_companion,
      companion_name,
    }: UpdateGuestInput,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `UPDATE guest
       SET name = $3,
           email = $4,
           phone = $5,
           note = $6,
           status = $7,
           attendee_type = $8,
           has_companion = $9,
           companion_name = $10
       WHERE id = $1 AND list_id = $2 AND is_active = TRUE
       RETURNING id, list_id, name, email, phone, note, status, attendee_type, has_companion, companion_name, created_at, is_active`,
      [
        guestId,
        listId,
        name,
        email ?? null,
        phone ?? null,
        note ?? null,
        status,
        attendee_type ?? "adult",
        has_companion ?? false,
        has_companion ? companion_name ?? null : null,
      ]
    );

    if (!rows[0]) {
      return null;
    }

    return mapGuestRow(rows[0] as GuestRow);
  }

  public static async deactivateGuest(
    guestId: string,
    listId: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const result = await runner.query(
      `UPDATE guest
       SET is_active = FALSE
       WHERE id = $1 AND list_id = $2 AND is_active = TRUE`,
      [guestId, listId]
    );

    return (result.rowCount ?? 0) > 0;
  }
}
