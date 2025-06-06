import bcrypt from "bcrypt";
import { getDb } from "./db";

export interface User {
  id: number;
  email: string;
  password: string;
  userName: string;
  recoverEmail: string;
}

async function ensureUsersTableExists() {
  const db = await getDb();
  if (!db) return;

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      userName VARCHAR(50) NOT NULL,
      recoverEmail VARCHAR(255) NOT NULL
    )
  `;
  await db.query(createTableQuery);
}

export async function signUp(
  userName: string,
  recoverEmail: string,
  email: string,
  password: string
): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  await ensureUsersTableExists();
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    "INSERT INTO users (email, password, userName, recoverEmail) VALUES (?, ?, ?, ?)",
    [email, hashedPassword, userName, recoverEmail]
  );

  const insertId = (result as any).insertId;
  if (!insertId) return null;

  return { id: insertId, email, password, userName, recoverEmail };
}

export async function getUserById(id: number): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  const users = rows as User[];
  if (users.length === 0) return null;
  return users[0];
}

export async function login(email: string, password: string) {
  const db = await getDb();
  if (!db) return null;

  const [rows] = await db.query(
    "SELECT id, email, password, userName, recoverEmail FROM users WHERE email = ?",
    [email]
  );

  const user = (rows as any[])[0];
  if (!user) return null;

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return null;

  const { password: _, ...safeUser } = user; // Remove password before returning
  return safeUser;
}

export async function deleteUser(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
  return (result as any).affectedRows > 0;
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];

  const [rows] = await db.query("SELECT * FROM users");
  return rows as User[];
}
