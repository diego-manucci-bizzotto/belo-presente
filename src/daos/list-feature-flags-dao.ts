import { Database } from "@/lib/pg/database";
import { PoolClient } from "pg";
import { ListFeatureFlags } from "@/lib/list-feature-flags";

type ListFeatureFlagsRow = {
  list_id: string | number;
  attendance_confirmation_enabled: boolean;
  notes_enabled: boolean;
  contributions_enabled: boolean;
  share_enabled: boolean;
  selection_notifications_enabled: boolean;
};

type UpsertListFeatureFlagsInput = {
  listId: string;
  attendanceConfirmationEnabled: boolean;
  notesEnabled: boolean;
  contributionsEnabled: boolean;
  shareEnabled: boolean;
  selectionNotificationsEnabled: boolean;
};

const mapRow = (row: ListFeatureFlagsRow): ListFeatureFlags => {
  return {
    list_id: String(row.list_id),
    attendance_confirmation_enabled: row.attendance_confirmation_enabled,
    notes_enabled: row.notes_enabled,
    contributions_enabled: row.contributions_enabled,
    share_enabled: row.share_enabled,
    selection_notifications_enabled: row.selection_notifications_enabled,
  };
};

export class ListFeatureFlagsDAO {
  private constructor() {}

  public static async getByListId(listId: string, client?: PoolClient) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT
         list_id,
         attendance_confirmation_enabled,
         notes_enabled,
         contributions_enabled,
         share_enabled,
         selection_notifications_enabled
       FROM list_feature_flags
       WHERE list_id = $1`,
      [listId]
    );

    if (!rows[0]) {
      return null;
    }

    return mapRow(rows[0] as ListFeatureFlagsRow);
  }

  public static async upsertByListId(
    {
      listId,
      attendanceConfirmationEnabled,
      notesEnabled,
      contributionsEnabled,
      shareEnabled,
      selectionNotificationsEnabled,
    }: UpsertListFeatureFlagsInput,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `INSERT INTO list_feature_flags (
         list_id,
         attendance_confirmation_enabled,
         notes_enabled,
         contributions_enabled,
         share_enabled,
         selection_notifications_enabled
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (list_id)
       DO UPDATE SET
         attendance_confirmation_enabled = EXCLUDED.attendance_confirmation_enabled,
         notes_enabled = EXCLUDED.notes_enabled,
         contributions_enabled = EXCLUDED.contributions_enabled,
         share_enabled = EXCLUDED.share_enabled,
         selection_notifications_enabled = EXCLUDED.selection_notifications_enabled
       RETURNING
         list_id,
         attendance_confirmation_enabled,
         notes_enabled,
         contributions_enabled,
         share_enabled,
         selection_notifications_enabled`,
      [
        listId,
        attendanceConfirmationEnabled,
        notesEnabled,
        contributionsEnabled,
        shareEnabled,
        selectionNotificationsEnabled,
      ]
    );

    return mapRow(rows[0] as ListFeatureFlagsRow);
  }
}
