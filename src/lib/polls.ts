import { getDb } from "./db";

async function ensurePollTableExists() {
  const db = await getDb();
  if (!db) return;

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS live_poll (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question VARCHAR(255) NOT NULL,
      options JSON NOT NULL,
      createdBy VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await db.query(createTableQuery);
}

export async function createPoll({
  question,
  options,
  createdBy,
}: {
  question: string;
  options: string[];
  createdBy: string;
}) {
  const db = await getDb();
  if (!db) return null;

  await ensurePollTableExists();

  const [result] = await db.query(
    "INSERT INTO live_poll (question, options, createdBy) VALUES (?, ?, ?)",
    [question, JSON.stringify(options), createdBy]
  );

  const insertId = (result as any).insertId;
  if (!insertId) return null;

  return {
    id: insertId,
    question,
    options,
    createdBy,
    createdAt: new Date(),
  };
}

export async function getPoll(id: string) {
  const db = await getDb();
  if (!db) return null;

  const [rows] = await db.query("SELECT * FROM live_poll WHERE id = ?", [id]);
  const poll = (rows as any[])[0];

  if (!poll) return null;

  return {
    ...poll,
    options: JSON.parse(poll.options),
  };
}

export async function getAllPolls() {
  const db = await getDb();
  if (!db) return [];

  const [rows] = await db.query(
    "SELECT * FROM live_poll ORDER BY createdAt DESC"
  );

  return (rows as any[]).map((poll) => ({
    ...poll,
    options: JSON.parse(poll.options),
  }));
}

export async function deletePoll(id: string) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.query("DELETE FROM live_poll WHERE id = ?", [id]);

  const affectedRows = (result as any).affectedRows;
  if (affectedRows === 0) return null;

  return { id };
}
