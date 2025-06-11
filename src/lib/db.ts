import mysql from "mysql2/promise";

// No need for dotenv.config() in production (Vercel)
if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
}

export const getDb = async () => {
  // Optional: validate env vars
  const requiredVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  requiredVars.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing env variable: ${key}`);
    }
  });

  // Create DB if not exists (can be skipped in prod if already created)
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.MYSQL_PORT || "3306"),
  });

  await db.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  await db.end();

  // Return pool connection
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
};
