import { createLivePollQes, getAllPolls } from "@/lib/live_polls";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      options,
      userEmail,
    }: {
      title?: string;
      options?: string[];
      userEmail?: string;
    } = body;

    // Creating new poll requires title, options, userEmail
    if (!title || !options || !userEmail) {
      throw new Error(
        "Missing required fields: title, options, and userEmail are required."
      );
    }

    // Creating new poll starts with empty votes array
    const insertedPoll = await createLivePollQes({
      title,
      options,
      userEmail,
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
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (email) {
      const data = await getAllPolls(email);
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json(
      { error: "Missing email or pollId parameter" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Poll fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
