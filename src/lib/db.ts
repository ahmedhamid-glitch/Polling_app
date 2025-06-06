import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let db: mysql.Connection | null = null;

export async function getDb() {
  if (db) return db;

  try {
    db = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    return db;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return null;
  }
}

export async function closeDb() {
  if (db) {
    await db.end();
    db = null;
  }
}
