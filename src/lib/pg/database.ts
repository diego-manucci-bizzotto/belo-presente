import { Pool } from "pg";

export const pool = new Pool({
  user: process.env.POSTGRES_DATABASE_USER,
  host: process.env.POSTGRES_DATABASE_HOST,
  database: process.env.POSTGRES_DATABASE_NAME,
  password: process.env.POSTGRES_DATABASE_PASSWORD,
  port: parseInt(process.env.POSTGRES_DATABASE_PORT || "5432", 10),
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});