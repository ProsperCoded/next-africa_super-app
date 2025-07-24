import React, { useEffect, useState } from "react";
import {
  CometChatUIKit,
  UIKitSettingsBuilder,
} from "@cometchat/chat-uikit-react";
import CometChatApp from "./CometChat/CometChatApp";
import { CometChatProvider } from "./CometChat/context/CometChatContext";
import { setupLocalization } from "./CometChat/utils/utils";
import { getCurrentUserUID, getCurrentUser, logout } from "./utils/auth";

export const COMETCHAT_CONSTANTS = {
  APP_ID: process.env.NEXT_PUBLIC_COMETCHAT_APP_ID as string,
  REGION: process.env.NEXT_PUBLIC_COMETCHAT_REGION as string,
  AUTH_KEY: process.env.NEXT_PUBLIC_COMETCHAT_AUTH_KEY as string,
};

// Functional Component
const CometChatNoSSR: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUID, setCurrentUID] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeCometChat = async () => {
      try {
        console.log("Starting CometChat initialization...");

        // Get current user data from localStorage with better error handling
        const uid = getCurrentUserUID();
        const userData = getCurrentUser();

        console.log("Checking localStorage data:", { uid, userData });

        if (!uid || !userData) {
          console.error("No user UID or user data found in localStorage", {
            uid,
            userData,
          });
          // Don't call logout immediately, just redirect to auth
          window.location.href = "/auth/welcome";
          return;
        }

        console.log("Found user:", {
          uid,
          name: userData.name,
          email: userData.email,
        });
        setCurrentUID(uid);

        // Validate environment variables
        if (
          !COMETCHAT_CONSTANTS.APP_ID ||
          !COMETCHAT_CONSTANTS.REGION ||
          !COMETCHAT_CONSTANTS.AUTH_KEY
        ) {
          throw new Error(
            "Missing CometChat configuration. Please check your environment variables."
          );
        }

        console.log("CometChat config:", {
          APP_ID: COMETCHAT_CONSTANTS.APP_ID,
          REGION: COMETCHAT_CONSTANTS.REGION,
          AUTH_KEY: COMETCHAT_CONSTANTS.AUTH_KEY ? "***" : "missing",
        });

        // Initialize UIKit settings using the same pattern as CometChatAppCredentials.tsx
        const uiKitSettings = new UIKitSettingsBuilder()
          .setAppId(COMETCHAT_CONSTANTS.APP_ID)
          .setRegion(COMETCHAT_CONSTANTS.REGION)
          .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
          .subscribePresenceForAllUsers()
          .build();

        // Initialize CometChat UIKit
        console.log("Initializing CometChat UIKit...");
        await CometChatUIKit.init(uiKitSettings);
        setupLocalization();
        setIsInitialized(true);
        console.log("CometChat initialization completed successfully");

        // Check if user is already logged in
        console.log("Checking if user is already logged in...");
        const loggedInUser = await CometChatUIKit.getLoggedinUser();

        if (loggedInUser && loggedInUser.getUid?.() === uid) {
          console.log("User already logged in to CometChat:", {
            uid: loggedInUser.getUid?.(),
            name: loggedInUser.getName?.() || "Unknown",
          });
          setIsLoggedIn(true);
        } else {
          // Login the user with AuthKey
          console.log("Logging in user to CometChat:", { uid });

          try {
            const user = await CometChatUIKit.login(uid);
            console.log("CometChat login successful:", {
              uid: user.getUid?.(),
              name: user.getName?.() || "Unknown",
            });
            setIsLoggedIn(true);
          } catch (loginError: any) {
            console.error("CometChat login failed:", loginError);

            // If user doesn't exist, try to create them first
            if (
              loginError.code === "ERR_UID_NOT_FOUND" ||
              loginError.message?.includes("does not exist")
            ) {
              console.log(
                "User doesn't exist in CometChat, this might be expected for new users"
              );
              setError(
                "User account setup incomplete. Please contact support or try signing up again."
              );
            } else {
              setError(
                `Login failed: ${loginError.message || "Unknown error"}`
              );
            }
            return;
          }
        }
      } catch (error: any) {
        console.error("CometChat initialization or login failed:", error);
        setError(error.message || "Failed to initialize chat system");

        // Only redirect to auth if it's a configuration error
        if (
          error.message?.includes("configuration") ||
          error.message?.includes("environment")
        ) {
          // Don't redirect, show error instead
          return;
        }

        // For other errors, log out and redirect
        // logout();
        // window.location.href = "/auth/welcome";
      }
    };

    initializeCometChat();
  }, []);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Chat System Error
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setError(null);
                  window.location.reload();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mr-2"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/auth/welcome";
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while initializing
  if (!isInitialized || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">
            {!isInitialized ? "Initializing chat..." : "Connecting..."}
          </p>
          {currentUID && (
            <p className="text-xs text-gray-500">User: {currentUID}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    /* The CometChatApp component requires a parent element with an explicit height and width
   to render properly. Ensure the container has defined dimensions, and adjust them as needed  
   based on your layout requirements. */
    <div style={{ width: "100vw", height: "100dvh" }}>
      <CometChatProvider>
        <CometChatApp />
      </CometChatProvider>
    </div>
  );
};

export default CometChatNoSSR;
