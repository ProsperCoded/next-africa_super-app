import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, initializeDatabase } from "@/app/lib/turso";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    console.log("Checking if email exists:", email);

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Initialize database if needed
    await initializeDatabase();

    // Check if user exists
    const existingUser = await getUserByEmail(email.toLowerCase());

    if (existingUser) {
      console.log("Email already exists:", email);
      return NextResponse.json(
        {
          exists: true,
          message:
            "An account with this email already exists. Please sign in instead.",
        },
        { status: 200 }
      );
    }

    console.log("Email is available:", email);
    return NextResponse.json(
      {
        exists: false,
        message: "Email is available",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Check email error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
