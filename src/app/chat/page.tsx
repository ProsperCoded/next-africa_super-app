"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuthState } from "../utils/auth";
import CometChatAppWrapper from "../CometChatAppWrapper";

export default function Chat() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Chat page: Checking authentication...");
    const authState = checkAuthState();
    console.log("Chat page: Auth state:", authState);

    if (authState.isAuthenticated && authState.user) {
      console.log("User authenticated, showing chat");
      setIsAuthenticated(true);
      setIsLoading(false);
    } else {
      console.log("User not authenticated, redirecting to welcome");
      router.push("/auth/welcome");
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <CometChatAppWrapper />
    </div>
  );
}
