import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createUser, initializeDatabase } from "@/app/lib/turso";

// Generate CometChat-friendly UID
function generateUID(email: string): string {
  const emailPrefix = email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 999)
    .toString()
    .padStart(3, "0");
  return `next_${emailPrefix}_${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } =
      await request.json();

    console.log("Signup request for:", { email, firstName, lastName, phone });

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Email, password, first name, and last name are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Initialize database if needed
    await initializeDatabase();

    // Generate UID for CometChat
    const uid = generateUID(email);

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    console.log("Creating user with UID:", uid);

    // Create user in Turso database
    const user = await createUser({
      uid,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      phone: phone || undefined,
    });

    console.log("User created in Turso, now creating in CometChat...");

    // Create user in CometChat
    const createCometChatResponse = await fetch(
      `${request.nextUrl.origin}/api/create-cometchat-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          phone: user.phone,
        }),
      }
    );

    const cometChatData = await createCometChatResponse.json();

    if (!createCometChatResponse.ok) {
      // If CometChat creation fails, we should ideally rollback the Turso user
      // For this MVP, we'll log the error and continue
      console.error("CometChat user creation failed:", cometChatData);

      // Only fail if it's not a "user already exists" error
      if (createCometChatResponse.status !== 409) {
        return NextResponse.json(
          { error: "Failed to create chat account. Please try again." },
          { status: 500 }
        );
      }
    }

    console.log("User signup completed successfully");

    // Return user data (without password hash)
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        uid: user.uid,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        name: `${user.first_name} ${user.last_name}`,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);

    if (error.message?.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
