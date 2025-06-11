import { NextResponse } from "next/server";
import { signUp, login } from "@/lib/users";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userName, recoverEmail, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    let user;

    if (action === "signup") {
      if (!userName || !recoverEmail) {
        return NextResponse.json(
          { error: "userName and recoverEmail are required for signup" },
          { status: 400 }
        );
      }

      user = await signUp(userName, recoverEmail, email, password);
      if (!user) {
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }
    } else if (action === "login") {
      user = await login(email, password);
      if (!user) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Exclude password and sensitive fields
    const { password: _, ...safeUser } = user;

    // Generate JWT Token
    const token = jwt.sign(
      { id: safeUser.id, email: safeUser.email, userName: safeUser.userName },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        message: action === "signup" ? "User created" : "User signed in",
        user: safeUser,
        token,
      },
      { status: action === "signup" ? 201 : 200 }
    );
  } catch (error: any) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
