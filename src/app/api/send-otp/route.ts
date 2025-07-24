import { NextRequest, NextResponse } from "next/server";

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

    // Send email via Brevo
    const brevoApiKey = process.env.NEXT_PRIVATE_BREVO_API_KEY;

    if (!brevoApiKey) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const emailData = {
      sender: {
        name: "NEXT - Africa's Super-App",
        email: "enweremproper@gmail.com",
      },
      to: [
        {
          email: email,
          name: name || "User",
        },
      ],
      subject: `Your NEXT verification code: ${otp}`,
      htmlContent: generateOTPEmailTemplate(otp, name),
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Brevo API error:", errorData);
      return NextResponse.json(
        { error: "Failed to send OTP email" },
        { status: 500 }
      );
    }

    console.log(`OTP sent to ${email}: ${otp}`); // For development

    // Return OTP to client for MVP (lazy solution)
    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      otp: otp, // Send OTP to client
      expiresIn: 600, // 10 minutes
      generatedAt: Date.now(),
      phone: phone, // Include phone for later use
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
