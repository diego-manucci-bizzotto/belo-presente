import { Database } from "@/lib/pg/database";
import { PoolClient } from "pg";
import { ProductPurchaseType } from "@/services/products/create-product";

type ProductRow = {
  id: string | number;
  list_id: string | number;
  name: string;
  description: string | null;
  url: string | null;
  image_url: string | null;
  price: string | number | null;
  currency: string;
  quantity: number;
  purchase_type: ProductPurchaseType;
  created_at: string;
  is_active: boolean;
};

type CreateProductInput = {
  listId: string;
  name: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  price?: number;
  currency: string;
  quantity: number;
  purchaseType: ProductPurchaseType;
};

const mapProductRow = (row: ProductRow) => {
  return {
    id: String(row.id),
    list_id: String(row.list_id),
    name: row.name,
    description: row.description,
    url: row.url,
    image_url: row.image_url,
    price: row.price === null ? null : Number(row.price),
    currency: row.currency,
    quantity: row.quantity,
    purchase_type: row.purchase_type,
    created_at: row.created_at,
    is_active: row.is_active,
  };
};

export class ProductDAO {
  private constructor() {}

  public static async createProduct(
    {
      listId,
      name,
      description,
      url,
      imageUrl,
      price,
      currency,
      quantity,
      purchaseType,
    }: CreateProductInput,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `INSERT INTO product
       (list_id, name, description, url, image_url, price, currency, quantity, purchase_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, list_id, name, description, url, image_url, price, currency, quantity, purchase_type, created_at, is_active`,
      [
        listId,
        name,
        description ?? null,
        url ?? null,
        imageUrl ?? null,
        price ?? null,
        currency,
        quantity,
        purchaseType,
      ]
    );

    return mapProductRow(rows[0] as ProductRow);
  }

  public static async getProductsByListId(listId: string, client?: PoolClient) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT id, list_id, name, description, url, image_url, price, currency, quantity, purchase_type, created_at, is_active
       FROM product
       WHERE list_id = $1 AND is_active = TRUE
       ORDER BY created_at DESC`,
      [listId]
    );

    return rows.map((row) => mapProductRow(row as ProductRow));
  }
}
