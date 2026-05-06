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
  gifted_count?: string | number | null;
  remaining_quantity?: string | number | null;
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

type UpdateProductInput = CreateProductInput & {
  productId: string;
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
    gifted_count: row.gifted_count === undefined || row.gifted_count === null ? undefined : Number(row.gifted_count),
    remaining_quantity:
      row.remaining_quantity === undefined || row.remaining_quantity === null
        ? undefined
        : Number(row.remaining_quantity),
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

  public static async getProductByIdAndListId(
    productId: string,
    listId: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT id, list_id, name, description, url, image_url, price, currency, quantity, purchase_type, created_at, is_active
       FROM product
       WHERE id = $1 AND list_id = $2 AND is_active = TRUE`,
      [productId, listId]
    );

    if (!rows[0]) {
      return null;
    }

    return mapProductRow(rows[0] as ProductRow);
  }

  public static async updateProduct(
    {
      productId,
      listId,
      name,
      description,
      url,
      imageUrl,
      price,
      currency,
      quantity,
      purchaseType,
    }: UpdateProductInput,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `UPDATE product
       SET name = $3,
           description = $4,
           url = $5,
           image_url = $6,
           price = $7,
           currency = $8,
           quantity = $9,
           purchase_type = $10
       WHERE id = $1 AND list_id = $2 AND is_active = TRUE
       RETURNING id, list_id, name, description, url, image_url, price, currency, quantity, purchase_type, created_at, is_active`,
      [
        productId,
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

    if (!rows[0]) {
      return null;
    }

    return mapProductRow(rows[0] as ProductRow);
  }

  public static async deactivateProduct(
    productId: string,
    listId: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const result = await runner.query(
      `UPDATE product
       SET is_active = FALSE
       WHERE id = $1 AND list_id = $2 AND is_active = TRUE`,
      [productId, listId]
    );

    return (result.rowCount ?? 0) > 0;
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

  public static async getPublicProductsByShareId(
    shareId: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT
         p.id,
         p.list_id,
         p.name,
         p.description,
         p.url,
         p.image_url,
         p.price,
         p.currency,
         p.quantity,
         p.purchase_type,
         p.created_at,
         p.is_active,
         COALESCE(g.gifted_count, 0) AS gifted_count,
         GREATEST(p.quantity - COALESCE(g.gifted_count, 0), 0) AS remaining_quantity
       FROM product p
       JOIN list l ON l.id = p.list_id
       LEFT JOIN (
         SELECT product_id, COUNT(*) AS gifted_count
         FROM gift_intent
         GROUP BY product_id
       ) g ON g.product_id = p.id
       WHERE l.share_id = $1
         AND l.active = TRUE
         AND p.is_active = TRUE
       ORDER BY p.created_at DESC`,
      [shareId]
    );

    return rows.map((row) => mapProductRow(row as ProductRow));
  }

  public static async getPublicProductByIdAndShareId(
    productId: string,
    shareId: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT
         p.id,
         p.list_id,
         p.name,
         p.description,
         p.url,
         p.image_url,
         p.price,
         p.currency,
         p.quantity,
         p.purchase_type,
         p.created_at,
         p.is_active,
         COALESCE(g.gifted_count, 0) AS gifted_count,
         GREATEST(p.quantity - COALESCE(g.gifted_count, 0), 0) AS remaining_quantity
       FROM product p
       JOIN list l ON l.id = p.list_id
       LEFT JOIN (
         SELECT product_id, COUNT(*) AS gifted_count
         FROM gift_intent
         GROUP BY product_id
       ) g ON g.product_id = p.id
       WHERE p.id = $1
         AND l.share_id = $2
         AND l.active = TRUE
         AND p.is_active = TRUE`,
      [productId, shareId]
    );

    if (!rows[0]) {
      return null;
    }

    return mapProductRow(rows[0] as ProductRow);
  }
}
