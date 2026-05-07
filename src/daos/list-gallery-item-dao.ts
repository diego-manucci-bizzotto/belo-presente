import { Database } from "@/lib/pg/database";
import { PoolClient } from "pg";

type ListGalleryItemRow = {
  id: string | number;
  list_id: string | number;
  image_url: string;
  caption: string;
  display_order: number | string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

type CreateListGalleryItemInput = {
  listId: string;
  imageUrl: string;
  caption?: string;
};

type UpdateListGalleryItemInput = {
  galleryItemId: string;
  listId: string;
  imageUrl: string;
  caption?: string;
};

type MoveDirection = "up" | "down";

const mapRow = (row: ListGalleryItemRow) => {
  return {
    id: String(row.id),
    list_id: String(row.list_id),
    image_url: row.image_url,
    caption: row.caption,
    display_order: Number(row.display_order),
    created_at: row.created_at,
    updated_at: row.updated_at,
    is_active: row.is_active,
  };
};

const BASE_COLUMNS = "id, list_id, image_url, caption, display_order, created_at, updated_at, is_active";

export class ListGalleryItemDAO {
  private constructor() {}

  public static async getItemsByListId(listId: string, client?: PoolClient) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT ${BASE_COLUMNS}
       FROM list_gallery_item
       WHERE list_id = $1
         AND is_active = TRUE
       ORDER BY display_order ASC, created_at ASC`,
      [listId]
    );

    return rows.map((row) => mapRow(row as ListGalleryItemRow));
  }

  public static async getPublicItemsByShareId(shareId: string, client?: PoolClient) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT
         g.id,
         g.list_id,
         g.image_url,
         g.caption,
         g.display_order,
         g.created_at,
         g.updated_at,
         g.is_active
       FROM list_gallery_item g
       JOIN list l ON l.id = g.list_id
       WHERE l.share_id = $1
         AND l.active = TRUE
         AND g.is_active = TRUE
       ORDER BY g.display_order ASC, g.created_at ASC`,
      [shareId]
    );

    return rows.map((row) => mapRow(row as ListGalleryItemRow));
  }

  public static async createItem(
    {
      listId,
      imageUrl,
      caption,
    }: CreateListGalleryItemInput,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `INSERT INTO list_gallery_item (list_id, image_url, caption, display_order)
       VALUES (
         $1,
         $2,
         $3,
         COALESCE(
           (
             SELECT MAX(display_order) + 1
             FROM list_gallery_item
             WHERE list_id = $1
               AND is_active = TRUE
           ),
           0
         )
       )
       RETURNING ${BASE_COLUMNS}`,
      [listId, imageUrl, caption ?? ""]
    );

    return mapRow(rows[0] as ListGalleryItemRow);
  }

  public static async getItemByIdAndListId(
    galleryItemId: string,
    listId: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `SELECT ${BASE_COLUMNS}
       FROM list_gallery_item
       WHERE id = $1
         AND list_id = $2
         AND is_active = TRUE`,
      [galleryItemId, listId]
    );

    if (!rows[0]) {
      return null;
    }

    return mapRow(rows[0] as ListGalleryItemRow);
  }

  public static async updateItemByIdAndListId(
    {
      galleryItemId,
      listId,
      imageUrl,
      caption,
    }: UpdateListGalleryItemInput,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const { rows } = await runner.query(
      `UPDATE list_gallery_item
       SET image_url = $3,
           caption = $4,
           updated_at = NOW()
       WHERE id = $1
         AND list_id = $2
         AND is_active = TRUE
       RETURNING ${BASE_COLUMNS}`,
      [galleryItemId, listId, imageUrl, caption ?? ""]
    );

    if (!rows[0]) {
      return null;
    }

    return mapRow(rows[0] as ListGalleryItemRow);
  }

  public static async moveItemByDirection(
    galleryItemId: string,
    listId: string,
    direction: MoveDirection
  ) {
    const db = Database.getInstance();

    return db.transaction(async (client) => {
      const { rows: currentRows } = await client.query(
        `SELECT ${BASE_COLUMNS}
         FROM list_gallery_item
         WHERE id = $1
           AND list_id = $2
           AND is_active = TRUE
         FOR UPDATE`,
        [galleryItemId, listId]
      );

      if (!currentRows[0]) {
        return null;
      }

      const currentItem = mapRow(currentRows[0] as ListGalleryItemRow);

      const neighborQuery =
        direction === "up"
          ? `SELECT ${BASE_COLUMNS}
             FROM list_gallery_item
             WHERE list_id = $1
               AND is_active = TRUE
               AND display_order < $2
             ORDER BY display_order DESC, created_at DESC
             LIMIT 1
             FOR UPDATE`
          : `SELECT ${BASE_COLUMNS}
             FROM list_gallery_item
             WHERE list_id = $1
               AND is_active = TRUE
               AND display_order > $2
             ORDER BY display_order ASC, created_at ASC
             LIMIT 1
             FOR UPDATE`;

      const { rows: neighborRows } = await client.query(
        neighborQuery,
        [listId, currentItem.display_order]
      );

      if (!neighborRows[0]) {
        return {
          moved: false,
          item: currentItem,
        };
      }

      const neighborItem = mapRow(neighborRows[0] as ListGalleryItemRow);

      await client.query(
        `UPDATE list_gallery_item
         SET display_order = $3,
             updated_at = NOW()
         WHERE id = $1
           AND list_id = $2`,
        [currentItem.id, listId, neighborItem.display_order]
      );

      await client.query(
        `UPDATE list_gallery_item
         SET display_order = $3,
             updated_at = NOW()
         WHERE id = $1
           AND list_id = $2`,
        [neighborItem.id, listId, currentItem.display_order]
      );

      const { rows: updatedRows } = await client.query(
        `SELECT ${BASE_COLUMNS}
         FROM list_gallery_item
         WHERE id = $1
           AND list_id = $2`,
        [currentItem.id, listId]
      );

      return {
        moved: true,
        item: mapRow(updatedRows[0] as ListGalleryItemRow),
      };
    });
  }

  public static async deactivateItem(
    galleryItemId: string,
    listId: string,
    client?: PoolClient
  ) {
    const db = Database.getInstance();
    const runner = client || db;

    const result = await runner.query(
      `UPDATE list_gallery_item
       SET is_active = FALSE,
           updated_at = NOW()
       WHERE id = $1
         AND list_id = $2
         AND is_active = TRUE`,
      [galleryItemId, listId]
    );

    return (result.rowCount ?? 0) > 0;
  }
}

