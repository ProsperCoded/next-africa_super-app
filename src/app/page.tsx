"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuthState, AuthState } from "./utils/auth";
import CometChatAppWrapper from "./CometChatAppWrapper";
import LoadingScreen from "./components/LoadingScreen";

export default function Home() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication state on mount with delay to handle race conditions
    const checkAuth = async () => {
      // Add a small delay to ensure localStorage is ready after redirects
      await new Promise((resolve) => setTimeout(resolve, 50));

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
      // If currentUser or userCredentials are removed/changed, it means logout occurred
      if (e.key === "currentUser" || e.key === "userCredentials") {
        console.log("Storage changed, rechecking auth...");

        // If the storage item was removed (logout), redirect immediately
        if (e.newValue === null && e.oldValue !== null) {
          console.log("Logout detected in another tab, redirecting...");
          window.location.href = "/auth/welcome";
          return;
        }

        checkAuth();
      }

      // Also listen for a custom logout event for immediate cross-tab logout
      if (e.key === "logout-trigger") {
        console.log("Logout trigger detected from another tab");
        window.location.href = "/auth/welcome";
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router]);

  // Show loading screen while checking auth
  if (isLoading) {
    return <LoadingScreen message="Initializing NEXT..." />;
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
