import { getDb } from "./db";

// Ensure live_poll table exists with TEXT instead of JSON for compatibility
async function ensureLivePollTableExists() {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS live_poll (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL UNIQUE,
      options TEXT NOT NULL,
      userEmail VARCHAR(255) NOT NULL,
      FOREIGN KEY (userEmail) REFERENCES users(email)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
  `;

  await db.query(createTableQuery);
}

// Create a new poll
export async function createLivePollQes({
  title,
  options,
  userEmail,
}: {
  title: string;
  options: string[];
  userEmail: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  await ensureLivePollTableExists();

  const optionsStr = JSON.stringify(options);

  const [result] = await db.query(
    "INSERT INTO live_poll (title, options, userEmail) VALUES (?, ?, ?)",
    [title, optionsStr, userEmail]
  );

  const insertId = (result as any).insertId;
  if (!insertId) return null;

  return { pollIdVoteData: insertId };
}

// Fetch all polls for a given user
export async function getAllPolls(email: string) {
  const db = await getDb();
  if (!db) {
    console.error("Database connection failed - getDb() returned null");
    throw new Error("Database connection failed");
  }

  await ensureLivePollTableExists();

  try {
    const [result] = await db.query(
      "SELECT * FROM live_poll WHERE userEmail = ?",
      [email]
    );

    // Parse options JSON string back into array
    const parsedPolls = (result as any[]).map((poll) => ({
      ...poll,
      options: JSON.parse(poll.options),
    }));

    return { allPolls: parsedPolls };
  } catch (error: any) {
    console.error("Error in getAllPolls:", error);
    throw new Error(`Failed to fetch polls from database: ${error.message}`);
  }
}
