import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, otp, storedOtp, generatedAt } = await request.json();

    if (!email || !otp || !storedOtp || !generatedAt) {
      return NextResponse.json(
        { error: "Email, OTP, and verification data are required" },
        { status: 400 }
      );
    }

    // Check if OTP is expired (10 minutes)
    const now = Date.now();
    const expiryTime = generatedAt + 10 * 60 * 1000; // 10 minutes

    if (now > expiryTime) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedOtp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
