// lib/init-db.ts
import mysql from "mysql2/promise";

const databaseName = "polling_app";

export async function initDB() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Freedom22*",
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
  await connection.end();

  return mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Freedom22*",
    database: databaseName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

export const db = await initDB();
