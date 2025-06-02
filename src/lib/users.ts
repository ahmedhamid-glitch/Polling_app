// import { db } from "./db";

// export interface User {
//   id: number;
//   email: string;
//   password: string;
// }

// async function ensureUsersTableExists() {
//   const createTableQuery = `
//     CREATE TABLE IF NOT EXISTS users (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       email VARCHAR(255) NOT NULL UNIQUE,
//       password VARCHAR(255) NOT NULL
//     )
//   `;
//   await db.query(createTableQuery);
// }

// export async function createUser(
//   email: string,
//   password: string
// ): Promise<User | null> {
//   await ensureUsersTableExists();
//   const [result] = await db.query(
//     "INSERT INTO users (email, password) VALUES (?, ?)",
//     [email, password]
//   );

//   const insertId = (result as any).insertId;
//   if (!insertId) return null;

//   return { id: insertId, email, password };
// }

// export async function getUserById(id: number): Promise<User | null> {
//   const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
//   const users = rows as User[];
//   if (users.length === 0) return null;
//   return users[0];
// }

// export async function updateUser(
//   id: number,
//   email?: string,
//   password?: string
// ): Promise<boolean> {
//   const fields = [];
//   const values = [];

//   if (email) {
//     fields.push("email = ?");
//     values.push(email);
//   }

//   if (password) {
//     fields.push("password = ?");
//     values.push(password);
//   }

//   if (fields.length === 0) return false;

//   values.push(id);

//   const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
//   const [result] = await db.query(sql, values);

//   return (result as any).affectedRows > 0;
// }

// export async function deleteUser(id: number): Promise<boolean> {
//   const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
//   return (result as any).affectedRows > 0;
// }

// export async function getAllUsers(): Promise<User[]> {
//   const [rows] = await db.query("SELECT * FROM users");
//   return rows as User[];
// }

import { db } from "./db";

export interface User {
  id: number;
  email: string;
  password: string;
}

async function ensureUsersTableExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    )
  `;
  await db.query(createTableQuery);
}

export async function createUser(
  email: string,
  password: string
): Promise<User | null> {
  await ensureUsersTableExists();
  const [result] = await db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, password]
  );

  const insertId = (result as any).insertId;
  if (!insertId) return null;

  return { id: insertId, email, password };
}

export async function getUserById(id: number): Promise<User | null> {
  const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  const users = rows as User[];
  if (users.length === 0) return null;
  return users[0];
}

export async function updateUser(
  id: number,
  email?: string,
  password?: string
): Promise<boolean> {
  const fields = [];
  const values = [];

  if (email) {
    fields.push("email = ?");
    values.push(email);
  }

  if (password) {
    fields.push("password = ?");
    values.push(password);
  }

  if (fields.length === 0) return false;

  values.push(id);

  const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
  const [result] = await db.query(sql, values);

  return (result as any).affectedRows > 0;
}

export async function deleteUser(id: number): Promise<boolean> {
  const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
  return (result as any).affectedRows > 0;
}

export async function getAllUsers(): Promise<User[]> {
  const [rows] = await db.query("SELECT * FROM users");
  return rows as User[];
}


