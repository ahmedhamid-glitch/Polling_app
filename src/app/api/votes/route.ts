import { createVotes, getVotes } from "@/lib/votes";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userEmail,
      userName,
      vote,
      pollId,
    }: {
      userEmail: string;
      userName: string;
      vote: string;
      pollId: string;
    } = body;

    // Creating new poll requires title, options, userEmail
    if (!userEmail || !userName || !vote || !pollId) {
      throw new Error(
        "Missing required fields: title, options, and userEmail are required."
      );
    }

    // Creating new poll starts with empty votes array
    const insertedPoll = await createVotes({
      userEmail,
      userName,
      vote,
      pollId,
    });

    // Broadcast update to all clients listening to this poll
    const clients = (globalThis as any).__votesSSEClients?.[pollId] || [];
    clients.forEach((send: any) => {
      send({ type: "voteUpdate", pollId });
    });

    return NextResponse.json({ success: true, data: insertedPoll });
  } catch (error: any) {
    console.error("Error in POST /live_poll:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pollId = searchParams.get("pollId");
  try {
    if (!pollId) {
      throw new Error("Missing required field: pollId  are required.");
    }

    const insertedPoll = await getVotes({
      pollId,
    });
    return NextResponse.json({ success: true, data: insertedPoll });
  } catch (error: any) {
    console.error("Error in POST /live_poll:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
