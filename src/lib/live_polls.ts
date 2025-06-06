// import { db } from "./db";

// async function ensureLivePollTableExists() {
//   const createTableQuery = `
//     CREATE TABLE IF NOT EXISTS live_poll (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       title VARCHAR(255) NOT NULL UNIQUE,
//       options JSON NOT NULL,
//       userEmail VARCHAR(255) NOT NULL,
//       votes JSON,
//       FOREIGN KEY (userEmail) REFERENCES users(email)
//         ON DELETE CASCADE
//         ON UPDATE CASCADE
//       );
//   `;

//   await db.query(createTableQuery);
// }

// export async function createLivePollQes({
//   title,
//   options,
//   userEmail,
//   votes,
// }: {
//   title: string;
//   options: string[]; // array of strings
//   userEmail: string;
//   votes: string[];
// }) {
//   await ensureLivePollTableExists();

//   const optionsStr = JSON.stringify(options);
//   const votesStr = JSON.stringify(votes);

//   const [result] = await db.query(
//     "INSERT INTO live_poll (title, options, userEmail, votes) VALUES (?, ?, ?, ?)",
//     [title, optionsStr, userEmail, votesStr]
//   );

//   const insertId = (result as any).insertId;
//   if (!insertId) return null;

//   return { id: insertId, title, options, userEmail, votesStr };
// }

// export async function updateLivePollVotes({
//   pollId,
//   votes,
// }: {
//   pollId: string;
//   votes: {
//     vote: string;
//     userName: string;
//     userEmail: string;
//   }[];
// }) {
//   await ensureLivePollTableExists();

//   // Get existing votes
//   const [rows] = await db.query("SELECT votes FROM live_poll WHERE id = ?", [
//     pollId,
//   ]);
//   const existingVotesRaw = (rows as any)[0]?.votes ?? "[]";

//   let existingVotes: any[] = [];
//   try {
//     existingVotes = JSON.parse(existingVotesRaw);
//     if (!Array.isArray(existingVotes)) existingVotes = [];
//   } catch {
//     existingVotes = [];
//   }

//   // Append new vote(s)
//   const updatedVotes = [...existingVotes, ...votes];
//   const votesStr = JSON.stringify(updatedVotes);

//   const [result] = await db.query(
//     "UPDATE live_poll SET votes = ? WHERE id = ?",
//     [votesStr, pollId]
//   );

//   return {
//     pollId,
//     updated: (result as any).affectedRows > 0,
//     votes: updatedVotes,
//   };
// }

// export async function deleteLivePollVote({
//   pollId,
//   userName,
//   userEmail,
// }: {
//   pollId: string;
//   userName: string;
//   userEmail: string;
// }) {
//   await ensureLivePollTableExists();

//   // 1. Get current poll's votes
//   const [rows] = await db.query("SELECT votes FROM live_poll WHERE id = ?", [
//     pollId,
//   ]);

//   if (!rows || (rows as any[]).length === 0) {
//     throw new Error("Poll not found");
//   }

//   const currentVotes = JSON.parse((rows as any)[0].votes || "[]");

//   // 2. Remove vote with matching userEmail and userName
//   const updatedVotes = currentVotes.filter(
//     (vote: any) => vote.userEmail !== userEmail || vote.userName !== userName
//   );

//   // 3. Update poll with new votes array
//   const [result] = await db.query(
//     "UPDATE live_poll SET votes = ? WHERE id = ?",
//     [JSON.stringify(updatedVotes), pollId]
//   );

//   return {
//     pollId,
//     updated: (result as any).affectedRows > 0,
//     userName,
//     userEmail,
//   };
// }

// export async function getAllPolls(email: string) {
//   await ensureLivePollTableExists();
//   const [result] = await db.query(
//     "select * from live_poll where userEmail = ?",
//     [email]
//   );
//   console.log("const data :", result);
//   return { allPolls: result };
// }

// export async function getPollIdData(pollId: string) {
//   await ensureLivePollTableExists();
//   const [result] = await db.query("select * from live_poll where id = ?", [
//     pollId,
//   ]);
//   console.log("const data :", result);
//   return { pollIdData: result };
// }

import { db } from "./db";

async function ensureLivePollTableExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS live_poll (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL UNIQUE,
      options JSON NOT NULL,
      userEmail VARCHAR(255) NOT NULL,
      FOREIGN KEY (userEmail) REFERENCES users(email)
        ON DELETE CASCADE
        ON UPDATE CASCADE
      );
  `;

  await db.query(createTableQuery);
}

export async function createLivePollQes({
  title,
  options,
  userEmail,
}: {
  title: string;
  options: string[];
  userEmail: string;
}) {
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

// export async function updateLivePollVotes({
//   pollId,
//   votes,
// }: {
//   pollId: string;
//   votes: {
//     vote: string;
//     userName: string;
//     userEmail: string;
//   }[];
// }) {
//   await ensureLivePollTableExists();

//   // Get existing votes
//   const [rows] = await db.query("SELECT votes FROM live_poll WHERE id = ?", [
//     pollId,
//   ]);
//   const existingVotesRaw = (rows as any)[0]?.votes ?? "[]";

//   let existingVotes: any[] = [];
//   try {
//     existingVotes = JSON.parse(existingVotesRaw);
//     if (!Array.isArray(existingVotes)) existingVotes = [];
//   } catch {
//     existingVotes = [];
//   }

//   console.log("Existing Votes:", existingVotes);
//   console.log("New Votes:", votes);

//   // Append new vote(s)
//   const updatedVotes = [...existingVotes, ...votes];
//   console.log("Updated Votes:", updatedVotes);

//   const votesStr = JSON.stringify(updatedVotes);

//   const [result] = await db.query(
//     "UPDATE live_poll SET votes = ? WHERE id = ?",
//     [votesStr, pollId]
//   );

//   return {
//     pollId,
//     updated: (result as any).affectedRows > 0,
//     votes: updatedVotes,
//   };
// }

// export async function deleteLivePollVote({
//   pollId,
//   userName,
//   userEmail,
// }: {
//   pollId: string;
//   userName: string;
//   userEmail: string;
// }) {
//   await ensureLivePollTableExists();

//   // 1. Get current poll's votes
//   const [rows] = await db.query("SELECT votes FROM live_poll WHERE id = ?", [
//     pollId,
//   ]);

//   if (!rows || (rows as any[]).length === 0) {
//     throw new Error("Poll not found");
//   }

//   const currentVotes = JSON.parse((rows as any)[0].votes || "[]");

//   // 2. Remove vote with matching userEmail and userName
//   const updatedVotes = currentVotes.filter(
//     (vote: any) => vote.userEmail !== userEmail || vote.userName !== userName
//   );

//   // 3. Update poll with new votes array
//   const [result] = await db.query(
//     "UPDATE live_poll SET votes = ? WHERE id = ?",
//     [JSON.stringify(updatedVotes), pollId]
//   );

//   return {
//     pollId,
//     updated: (result as any).affectedRows > 0,
//     userName,
//     userEmail,
//   };
// }

export async function getAllPolls(email: string) {
  await ensureLivePollTableExists();
  const [result] = await db.query(
    "SELECT * FROM live_poll WHERE userEmail = ?",
    [email]
  );
  console.log("All polls for user:", result);
  return { allPolls: result };
}

// export async function getPollIdData(pollId: string) {
//   await ensureLivePollTableExists();
//   const [result] = await db.query("SELECT * FROM live_poll WHERE id = ?", [
//     pollId,
//   ]);
//   console.log("Poll data by ID:", result);
//   return { pollIdData: result };
// }
