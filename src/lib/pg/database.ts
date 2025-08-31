import {Pool, PoolClient, QueryResult} from "pg";

class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      user: process.env.POSTGRES_DATABASE_USER,
      host: process.env.POSTGRES_DATABASE_HOST,
      database: process.env.POSTGRES_DATABASE_NAME,
      password: process.env.POSTGRES_DATABASE_PASSWORD,
      port: parseInt(process.env.POSTGRES_DATABASE_PORT || "5432", 10),
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public static getPool(): Pool {
    return Database.getInstance().pool;
  }

  public async query(text: string, params?: any[]): Promise<QueryResult> {
    return this.pool.query(text, params);
  }

  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const result = await callback(client);

      await client.query('COMMIT');

      return result;
    } catch (error) {
      await client.query('ROLLBACK');

      throw error;
    } finally {
      client.release();
    }
  }
}

export {Database};