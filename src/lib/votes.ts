import { getDb } from "./db";

async function ensureVoteTableExists() {
  const db = await getDb();
  if (!db) return;

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pollId INT,
      userName VARCHAR(255) NOT NULL,
      userEmail VARCHAR(255) NOT NULL ,
      vote VARCHAR(255),
      FOREIGN KEY (pollId) REFERENCES live_poll(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
      );
  `;

  await db.query(createTableQuery);
}

export async function createVotes({
  userEmail,
  userName,
  vote,
  pollId,
}: {
  userEmail: string;
  userName: string;
  vote: string;
  pollId: string;
}) {
  const db = await getDb();
  if (!db) return null;

  await ensureVoteTableExists();

  // Check if a vote already exists for this userEmail and pollId
  const [existing] = await db.query(
    "SELECT id FROM votes WHERE userEmail = ? AND pollId = ?",
    [userEmail, pollId]
  );

  if ((existing as any[]).length > 0) {
    // Vote exists → update it
    const [result] = await db.query(
      "UPDATE votes SET vote = ?, userName = ? WHERE userEmail = ? AND pollId = ?",
      [vote, userName, userEmail, pollId]
    );
    return { updated: true, userEmail, userName, vote, pollId };
  } else {
    // Vote does not exist → insert new
    const [votes] = await db.query(
      "INSERT INTO votes (userEmail, userName, vote, pollId) VALUES (?, ?, ?, ?)",
      [userEmail, userName, vote, pollId]
    );
    const insertId = (votes as any).insertId;
    if (!insertId) return null;

    return { id: insertId, userEmail, userName, vote, pollId };
  }
}

export async function getVotes({ pollId }: { pollId: string }) {
  const db = await getDb();
  if (!db) return null;

  const [pollRows] = await db.query(`SELECT * FROM live_poll WHERE id = ?`, [
    pollId,
  ]);
  const [voteRows] = await db.query(`SELECT * FROM votes WHERE pollId = ?`, [
    pollId,
  ]);

  const poll = (pollRows as any[])[0];
  const votes = voteRows as any[];

  // Agar poll ya votes nahi milay to null return karo
  if (!poll || votes.length === 0) return null;

  return {
    ...poll,
    votes,
  };
}
