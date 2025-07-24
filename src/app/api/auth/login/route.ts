import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import {
  getUserByEmail,
  updateUserLastLogin,
  initializeDatabase,
} from "@/app/lib/turso";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log("Login attempt for:", email);

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Initialize database if needed
    await initializeDatabase();

    // Get user from database
    const user = await getUserByEmail(email.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      console.log("Password mismatch for user:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log("Password verified for user:", email);

    // Update last login time
    await updateUserLastLogin(user.uid);

    console.log("Login successful for user:", {
      uid: user.uid,
      email: user.email,
    });

    // Return user data (without password hash)
    return NextResponse.json({
      success: true,
      message: "Login successful",
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
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
