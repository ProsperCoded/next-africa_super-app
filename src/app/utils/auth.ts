export interface UserCredentials {
  uid: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserCredentials | null;
}

/**
 * Check the current authentication state
 */
export function checkAuthState(): AuthState {
  if (typeof window === "undefined") {
    console.log("Auth check: Window undefined (SSR)");
    return { isAuthenticated: false, user: null };
  }

  try {
    console.log("Auth check: Starting authentication check...");
    const currentUser = localStorage.getItem("currentUser");
    const userCredentials = localStorage.getItem("userCredentials");

    console.log("Auth check: Raw localStorage data:", {
      currentUser,
      userCredentials,
    });

    if (!currentUser || !userCredentials) {
      console.log("Auth check: Missing localStorage data");
      return { isAuthenticated: false, user: null };
    }

    const credentials = JSON.parse(userCredentials);
    console.log("Auth check: Parsed credentials:", credentials);

    // Validate that the stored UID matches the current user
    if (credentials.uid !== currentUser) {
      console.warn("Auth check: UID mismatch detected, clearing auth data", {
        credentialsUID: credentials.uid,
        currentUser: currentUser,
      });
      logout();
      return { isAuthenticated: false, user: null };
    }

    // Validate required fields
    if (!credentials.uid || !credentials.email || !credentials.name) {
      console.warn("Auth check: Invalid credentials data, clearing auth data", {
        hasUID: !!credentials.uid,
        hasEmail: !!credentials.email,
        hasName: !!credentials.name,
      });
      logout();
      return { isAuthenticated: false, user: null };
    }

    console.log("Auth check: Authentication successful", {
      uid: credentials.uid,
      email: credentials.email,
      name: credentials.name,
    });

    return {
      isAuthenticated: true,
      user: credentials,
    };
  } catch (error) {
    console.error("Auth check: Error checking auth state:", error);
    logout();
    return { isAuthenticated: false, user: null };
  }
}

/**
 * Check if session is valid (not expired)
 */
export function isSessionValid(): boolean {
  const authState = checkAuthState();

  if (!authState.isAuthenticated || !authState.user) {
    return false;
  }

  // For this MVP, we'll consider sessions valid if they exist
  // In production, you might want to add expiration logic
  return true;
}

/**
 * Logout the current user
 */
export function logout(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userCredentials");

    // Clear any session storage as well
    sessionStorage.removeItem("signupData");
    sessionStorage.removeItem("otpData");

    console.log("User logged out successfully");
  } catch (error) {
    console.error("Error during logout:", error);
  }
}

/**
 * Get current user's UID for CometChat
 */
export function getCurrentUserUID(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem("currentUser");
  } catch (error) {
    console.error("Error getting current user UID:", error);
    return null;
  }
}

/**
 * Get current user's full credentials
 */
export function getCurrentUser(): UserCredentials | null {
  if (typeof window === "undefined") return null;

  try {
    const userCredentials = localStorage.getItem("userCredentials");
    if (!userCredentials) return null;

    return JSON.parse(userCredentials);
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Store user authentication data
 */
export function storeAuthData(uid: string, credentials: UserCredentials): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("currentUser", uid);
    localStorage.setItem("userCredentials", JSON.stringify(credentials));
    console.log("Auth data stored successfully");
  } catch (error) {
    console.error("Error storing auth data:", error);
  }
}

/**
 * Update user data (e.g., after profile changes)
 */
export function updateUserData(
  updatedCredentials: Partial<UserCredentials>
): void {
  if (typeof window === "undefined") return;

  try {
    const currentCredentials = getCurrentUser();
    if (!currentCredentials) {
      console.error("No current user to update");
      return;
    }

    const newCredentials = {
      ...currentCredentials,
      ...updatedCredentials,
    };

    localStorage.setItem("userCredentials", JSON.stringify(newCredentials));
    console.log("User data updated successfully");
  } catch (error) {
    console.error("Error updating user data:", error);
  }
}
