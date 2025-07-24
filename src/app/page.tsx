"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuthState, AuthState } from "./utils/auth";
import CometChatAppWrapper from "./CometChatAppWrapper";

export default function Home() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication state on mount
    const checkAuth = async () => {
      const state = checkAuthState();
      setAuthState(state);

      if (state.isAuthenticated && state.user) {
        console.log("User is authenticated, showing chat interface");
        setIsLoading(false);
      } else {
        console.log("User not authenticated, redirecting to welcome");
        setIsLoading(false);
        router.push("/auth/welcome");
      }
    };

    checkAuth();

    // Listen for storage changes (for multi-tab logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentUser" || e.key === "userCredentials") {
        console.log("Storage changed, rechecking auth...");
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading NEXT...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, will redirect to auth in useEffect
  if (!authState.isAuthenticated) {
    return null;
  }

  // User is authenticated, show the chat app
  return (
    <div className="h-screen w-screen overflow-hidden">
      <CometChatAppWrapper />
    </div>
  );
}
