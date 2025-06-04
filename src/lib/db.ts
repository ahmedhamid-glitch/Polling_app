import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // load .env variables

const createAndUpdateDB = async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await db.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  await db.end();

  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
};

export const db = await createAndUpdateDB();
