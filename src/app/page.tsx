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
