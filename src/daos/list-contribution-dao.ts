import { Database } from "@/lib/pg/database";
import { PoolClient } from "pg";

export type ListContributionStatus = "pending" | "received" | "cancelled";

type ListContributionRow = {
  id: string | number;
  list_id: string | number;
  contributor_name: string;
  contributor_contact: string | null;
  message: string | null;
  amount: string | number;
  currency: string;
  status: ListContributionStatus;
  created_at: string;
  is_active: boolean;
};

type CreateListContributionInput = {
  listId: string;
  contributorName: string;
  contributorContact?: string;
  message?: string;
  amount: number;
  currency: string;
  status?: ListContributionStatus;
};

type UpdateListContributionInput = {
  contributionId: string;
  listId: string;
  contributorName: string;
  contributorContact?: string;
  message?: string;
  amount: number;
  currency: string;
  status: ListContributionStatus;
};

const mapRow = (row: ListContributionRow) => {
  return {
    id: String(row.id),
    list_id: String(row.list_id),
    contributor_name: row.contributor_name,
    contributor_contact: row.contributor_contact,
    message: row.message,
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status,
    created_at: row.created_at,
    is_active: row.is_active,
  };
};

const BASE_COLUMNS =
  "id, list_id, contributor_name, contributor_contact, message, amount, currency, status, created_at, is_active";

export class ListContributionDAO {
  private constructor() {}

  public static async createContribution(
    {
      listId,
      contributorName,
      contributorContact,
      message,
      amount,
      currency,
      status = "pending",
    }: CreateListContributionInput,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `INSERT INTO list_contribution
       (list_id, contributor_name, contributor_contact, message, amount, currency, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${BASE_COLUMNS}`,
      [
        listId,
        contributorName,
        contributorContact ?? null,
        message ?? null,
        amount,
        currency,
        status,
      ]
    );

    return mapRow(rows[0] as ListContributionRow);
  }

  public static async getContributionsByListId(listId: string, client?: PoolClient) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT ${BASE_COLUMNS}
       FROM list_contribution
       WHERE list_id = $1
         AND is_active = TRUE
       ORDER BY created_at DESC`,
      [listId]
    );

    return rows.map((row) => mapRow(row as ListContributionRow));
  }

  public static async getContributionByIdAndListId(
    contributionId: string,
    listId: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT ${BASE_COLUMNS}
       FROM list_contribution
       WHERE id = $1
         AND list_id = $2
         AND is_active = TRUE`,
      [contributionId, listId]
    );

    if (!rows[0]) {
      return null;
    }

    return mapRow(rows[0] as ListContributionRow);
  }

  public static async updateContribution(
    {
      contributionId,
      listId,
      contributorName,
      contributorContact,
      message,
      amount,
      currency,
      status,
    }: UpdateListContributionInput,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `UPDATE list_contribution
       SET contributor_name = $3,
           contributor_contact = $4,
           message = $5,
           amount = $6,
           currency = $7,
           status = $8
       WHERE id = $1
         AND list_id = $2
         AND is_active = TRUE
       RETURNING ${BASE_COLUMNS}`,
      [
        contributionId,
        listId,
        contributorName,
        contributorContact ?? null,
        message ?? null,
        amount,
        currency,
        status,
      ]
    );

    if (!rows[0]) {
      return null;
    }

    return mapRow(rows[0] as ListContributionRow);
  }

  public static async deactivateContribution(
    contributionId: string,
    listId: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const result = await runner.query(
      `UPDATE list_contribution
       SET is_active = FALSE
       WHERE id = $1
         AND list_id = $2
         AND is_active = TRUE`,
      [contributionId, listId]
    );

    return (result.rowCount ?? 0) > 0;
  }
}

