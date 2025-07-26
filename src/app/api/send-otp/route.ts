import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate OTP email template
function generateOTPEmailTemplate(otp: string, name?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .logo { text-align: center; margin-bottom: 30px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #00f45e; text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px; letter-spacing: 4px; }
        .text { color: #333; line-height: 1.6; margin-bottom: 20px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1 style="color: #00f45e; margin: 0;">NEXT</h1>
          <p style="color: #666; margin: 5px 0;">Africa's Super-App</p>
        </div>
        
        <div class="text">
          <h2 style="color: #333;">Welcome${name ? ` ${name}` : ""}!</h2>
          <p>Thank you for joining NEXT. To complete your account verification, please use the following One-Time Password (OTP):</p>
        </div>
        
        <div class="otp-code">${otp}</div>
        
        <div class="text">
          <p><strong>Important:</strong></p>
          <ul>
            <li>This OTP is valid for 10 minutes only</li>
            <li>Do not share this code with anyone</li>
            <li>If you didn't request this code, please ignore this email</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>This is an automated message from NEXT. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const { email, phone, name } = await request.json();

    if (!email || !phone) {
      return NextResponse.json(
        { error: "Email and phone are required" },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Send email via Resend
    const result = await resend.emails.send({
      from: "NEXT <onboarding@resend.dev>", // You can verify your own domain for custom sender
      to: email,
      subject: `Your NEXT verification code: ${otp}`,
      html: generateOTPEmailTemplate(otp, name),
    });

    if (result.error) {
      console.error("Resend API error:", result.error);
      return NextResponse.json(
        { error: "Failed to send OTP email" },
        { status: 500 }
      );
    }

    console.log(`OTP sent to ${email}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      otp: otp,
      expiresIn: 600, // 10 minutes
      generatedAt: Date.now(),
      phone: phone,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
