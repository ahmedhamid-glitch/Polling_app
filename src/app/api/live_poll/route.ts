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

    if (!email) {
      return NextResponse.json(
        {
          error: "Email parameter is required",
          details: "No email was provided in the request URL",
        },
        { status: 400 }
      );
    }

    console.log("Fetching polls for email:", email);
    const data = await getAllPolls(email);
    console.log("Polls data:", data);

    if (!data || !data.allPolls) {
      return NextResponse.json(
        {
          error: "No polls found",
          details: `No polls found for email: ${email}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Poll fetch error:", error);
    const errorResponse = {
      error: error.message || "Failed to fetch polls",
      details: error.stack,
      type: error.name || "UnknownError",
    };
    console.error("Sending error response:", errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
