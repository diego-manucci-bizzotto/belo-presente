import { Database } from "@/lib/pg/database";
import { PoolClient } from "pg";
import { ProductPurchaseType } from "@/services/products/create-product";

type GiftIntentRow = {
  id: string | number;
  list_id: string | number;
  product_id: string | number;
  guest_name: string;
  guest_phone: string;
  guest_message: string | null;
  purchase_type: ProductPurchaseType;
  amount: string | number | null;
  currency: string;
  status: string;
  created_at: string;
};

type CreateGiftIntentInput = {
  listId: string;
  productId: string;
  guestName: string;
  guestPhone: string;
  guestMessage?: string;
  purchaseType: ProductPurchaseType;
  amount?: number;
  currency: string;
};

type MonetizationIntentRow = {
  purchase_type: ProductPurchaseType;
  status: string;
  currency: string;
  intents_count: string | number;
  total_amount: string | number | null;
};

type MonetizationTopProductRow = {
  product_id: string | number;
  product_name: string;
  purchase_type: ProductPurchaseType;
  currency: string;
  total_intents: string | number;
  active_intents: string | number;
  cancelled_intents: string | number;
  estimated_amount: string | number | null;
};

const mapGiftIntentRow = (row: GiftIntentRow) => {
  return {
    id: String(row.id),
    list_id: String(row.list_id),
    product_id: String(row.product_id),
    guest_name: row.guest_name,
    guest_phone: row.guest_phone,
    guest_message: row.guest_message,
    purchase_type: row.purchase_type,
    amount: row.amount === null ? null : Number(row.amount),
    currency: row.currency,
    status: row.status,
    created_at: row.created_at,
  };
};

export class GiftIntentDAO {
  private constructor() {}

  public static async createGiftIntent(
    {
      listId,
      productId,
      guestName,
      guestPhone,
      guestMessage,
      purchaseType,
      amount,
      currency,
    }: CreateGiftIntentInput,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `INSERT INTO gift_intent
       (list_id, product_id, guest_name, guest_phone, guest_message, purchase_type, amount, currency, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING id, list_id, product_id, guest_name, guest_phone, guest_message, purchase_type, amount, currency, status, created_at`,
      [
        listId,
        productId,
        guestName,
        guestPhone,
        guestMessage ?? null,
        purchaseType,
        amount ?? null,
        currency,
      ]
    );

    return mapGiftIntentRow(rows[0] as GiftIntentRow);
  }

  public static async getByIdAndProductAndList(
    giftIntentId: string,
    productId: string,
    listId: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT id, list_id, product_id, guest_name, guest_phone, guest_message, purchase_type, amount, currency, status, created_at
       FROM gift_intent
       WHERE id = $1 AND product_id = $2 AND list_id = $3`,
      [giftIntentId, productId, listId]
    );

    if (!rows[0]) {
      return null;
    }

    return mapGiftIntentRow(rows[0] as GiftIntentRow);
  }

  public static async cancelByIdAndProductAndList(
    giftIntentId: string,
    productId: string,
    listId: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `UPDATE gift_intent
       SET status = 'cancelled'
       WHERE id = $1
         AND product_id = $2
         AND list_id = $3
         AND status <> 'cancelled'
       RETURNING id, list_id, product_id, guest_name, guest_phone, guest_message, purchase_type, amount, currency, status, created_at`,
      [giftIntentId, productId, listId]
    );

    if (!rows[0]) {
      return null;
    }

    return mapGiftIntentRow(rows[0] as GiftIntentRow);
  }

  public static async getMonetizationSnapshotByListId(listId: string, client?: PoolClient) {
    const db = Database.getInstance();
    const runner = client || db;

    const [intentsResult, topProductsResult] = await Promise.all([
      runner.query(
        `SELECT
           purchase_type,
           status,
           currency,
           COUNT(*) AS intents_count,
           SUM(amount) AS total_amount
         FROM gift_intent
         WHERE list_id = $1
         GROUP BY purchase_type, status, currency`,
        [listId]
      ),
      runner.query(
        `SELECT
           p.id AS product_id,
           p.name AS product_name,
           p.purchase_type,
           p.currency,
           COUNT(g.id) AS total_intents,
           SUM(CASE WHEN g.status <> 'cancelled' THEN 1 ELSE 0 END) AS active_intents,
           SUM(CASE WHEN g.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_intents,
           SUM(CASE WHEN g.status <> 'cancelled' THEN COALESCE(g.amount, 0) ELSE 0 END) AS estimated_amount
         FROM product p
         LEFT JOIN gift_intent g ON g.product_id = p.id
         WHERE p.list_id = $1
           AND p.is_active = TRUE
         GROUP BY p.id, p.name, p.purchase_type, p.currency
         ORDER BY
           SUM(CASE WHEN g.status <> 'cancelled' THEN 1 ELSE 0 END) DESC,
           COUNT(g.id) DESC,
           p.created_at DESC`,
        [listId]
      ),
    ]);

    const intents = intentsResult.rows.map((row) => {
      const source = row as MonetizationIntentRow;
      return {
        purchase_type: source.purchase_type,
        status: source.status,
        currency: source.currency,
        intents_count: Number(source.intents_count),
        total_amount: source.total_amount === null ? null : Number(source.total_amount),
      };
    });

    const top_products = topProductsResult.rows.map((row) => {
      const source = row as MonetizationTopProductRow;
      return {
        product_id: String(source.product_id),
        product_name: source.product_name,
        purchase_type: source.purchase_type,
        currency: source.currency,
        total_intents: Number(source.total_intents),
        active_intents: Number(source.active_intents),
        cancelled_intents: Number(source.cancelled_intents),
        estimated_amount: source.estimated_amount === null ? 0 : Number(source.estimated_amount),
      };
    });

    return {
      intents,
      top_products,
    };
  }
}
