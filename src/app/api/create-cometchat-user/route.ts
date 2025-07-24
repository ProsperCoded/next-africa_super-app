import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { uid, name, email, phone, avatar } = await request.json();

    console.log("Creating CometChat user:", { uid, name, email, phone });

    if (!uid || !name || !email) {
      return NextResponse.json(
        { error: "UID, name, and email are required" },
        { status: 400 }
      );
    }

    const cometChatApiKey = process.env.COMETCHAT_API_KEY;
    const cometChatAppId = process.env.NEXT_PUBLIC_COMETCHAT_APP_ID;
    const cometChatRegion = process.env.NEXT_PUBLIC_COMETCHAT_REGION;

    if (!cometChatApiKey || !cometChatAppId || !cometChatRegion) {
      console.error("Missing CometChat configuration:", {
        hasApiKey: !!cometChatApiKey,
        hasAppId: !!cometChatAppId,
        hasRegion: !!cometChatRegion,
      });
      return NextResponse.json(
        { error: "CometChat service not configured" },
        { status: 500 }
      );
    }

    // Determine the correct API endpoint based on region
    let apiEndpoint = "https://api-us.cometchat.io/v3";
    if (cometChatRegion === "eu") {
      apiEndpoint = "https://api-eu.cometchat.io/v3";
    } else if (cometChatRegion === "in") {
      apiEndpoint = "https://api-in.cometchat.io/v3";
    }

    console.log("Using CometChat API endpoint:", apiEndpoint);

    const userData: any = {
      uid: uid,
      name: name,
      metadata: {
        email: email,
        phone: phone || null,
        createdAt: new Date().toISOString(),
      },
    };

    // Add avatar if provided
    if (avatar) {
      userData.avatar = avatar;
    }

    console.log("Sending user data to CometChat:", userData);

    const response = await fetch(`${apiEndpoint}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        appId: cometChatAppId,
        apiKey: cometChatApiKey,
      },
      body: JSON.stringify(userData),
    });

    const responseData = await response.json();

    console.log("CometChat API response:", {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
    });

    if (!response.ok) {
      console.error("CometChat API error:", {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      });

      // Handle specific errors
      if (responseData.error?.code === "ERR_UID_ALREADY_EXISTS") {
        console.log("User already exists in CometChat, this might be okay");
        return NextResponse.json(
          {
            error:
              "User already exists with this UID. Please try logging in instead.",
          },
          { status: 409 }
        );
      }

      if (responseData.error?.code === "ERR_INVALID_REQUEST") {
        return NextResponse.json(
          {
            error:
              "Invalid request data. Please check your information and try again.",
          },
          { status: 400 }
        );
      }

      if (responseData.error?.code === "ERR_INVALID_AUTH_TOKEN") {
        return NextResponse.json(
          { error: "Authentication failed. Please contact support." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: `Failed to create user in CometChat: ${
            responseData.error?.message || "Unknown error"
          }`,
          details: responseData.error,
        },
        { status: 500 }
      );
    }

    console.log("CometChat user created successfully:", responseData.data);

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: responseData.data,
    });
  } catch (error: any) {
    console.error("Create CometChat user error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
