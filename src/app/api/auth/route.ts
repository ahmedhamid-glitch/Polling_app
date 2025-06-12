import { NextResponse } from "next/server";
import { signUp, login, checkUserByEmail } from "@/lib/users";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userName, recoverEmail, email, password, verifyToken } =
      body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let user;

    if (action === "checkUserByEmail") {
      user = await checkUserByEmail(email);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (!verifyToken) {
        return NextResponse.json({ error: "Token required" }, { status: 401 });
      }

      try {
        const decoded: any = jwt.verify(verifyToken, JWT_SECRET);
        if (decoded.email !== email) {
          return NextResponse.json(
            { error: "Token email mismatch" },
            { status: 403 }
          );
        }

        // Valid token and email matches
        const { password: _, ...safeUser } = user as any;
        return NextResponse.json({ valid: true, user: safeUser });
      } catch (err) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }
    }

    // Validate password for login/signup
    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

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

    const { password: _, ...safeUser } = user;

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
