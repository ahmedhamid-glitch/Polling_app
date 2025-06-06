import { db } from "./db";

async function ensureVoteTableExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pollId INT,
      userName VARCHAR(255) NOT NULL,
      userEmail VARCHAR(255) NOT NULL,
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
  await ensureVoteTableExists();

  const [votes] = await db.query(
    "INSERT INTO votes (userEmail, userName, vote, pollId) VALUES (?, ?, ?, ?)",
    [userEmail, userName, vote, pollId]
  );
  const insertId = (votes as any).insertId;
  if (!insertId) return null;

  return { id: insertId, userEmail, userName, vote, pollId };
}
export async function updateVotes({
  userEmail,
  vote,
  pollId,
}: {
  userEmail: string;
  vote: string;
  pollId: string;
}) {
  await ensureVoteTableExists();

  const [result] = await db.query(
    "UPDATE votes SET vote = ? WHERE userEmail = ? AND pollId = ?",
    [vote, userEmail, pollId]
  );

  // Check if any row was affected (updated)
  const affectedRows = (result as any).affectedRows;
  if (affectedRows === 0) {
    return null; // no update done, maybe vote doesn't exist yet
  }

  return { userEmail, vote, pollId };
}

export async function getVotes({ pollId }: { pollId: string }) {
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

export async function deleteVotes({
  userEmail,
  userName,
  pollId,
}: {
  userEmail: string;
  userName: string;
  pollId: string;
}) {
  await ensureVoteTableExists();

  const [result] = await db.query(
    "DELETE FROM votes WHERE userEmail = ? AND userName = ? AND pollId = ?",
    [userEmail, userName, pollId]
  );

  const affectedRows = (result as any).affectedRows;

  if (affectedRows === 0) return null; // no rows deleted

  return { userEmail, userName, pollId };
}
