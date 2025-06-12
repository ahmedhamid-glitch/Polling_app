// db.ts
import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export async function getDb() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,
      waitForConnections: true,
      connectionLimit: 10, // adjust as needed
      queueLimit: 0,
    });
  }
  return pool;
}
