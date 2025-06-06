import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "./lib/db";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Check database connection
  const db = await getDb();
  if (!db) {
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/:path*",
};
