import { Database } from "@/lib/pg/database";
import { PoolClient } from "pg";
import { ProductPurchaseType } from "@/services/products/create-product";

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

    return rows[0];
  }
}
