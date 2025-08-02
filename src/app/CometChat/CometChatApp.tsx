/* eslint-disable react/no-unescaped-entities */
import "./styles/CometChatApp.css";
import { AppContextProvider } from "./context/AppContext";
import { CometChatHome } from "./components/CometChatHome/CometChatHome";
import React, { useEffect, useState } from "react";
import { useCometChatContext } from "./context/CometChatContext";
import { fontSizes } from "./styleConfig";
import { CometChat, LoginListener } from "@cometchat/chat-sdk-javascript";
import useSystemColorScheme from "./customHooks";
import { generateExtendedColors } from "./utils/utils";
import { CometChatUIKit } from "@cometchat/chat-uikit-react";
import "@cometchat/chat-uikit-react/css-variables.css";
import LogoutButton from "../components/LogoutButton";
import { getCurrentUser } from "../utils/auth";
import LoadingScreen from "../components/LoadingScreen";

interface CometChatHomeProps {
  /** Default user for the chat application (optional). */
  user?: CometChat.User;
  /** Default group for the chat application (optional). */
  group?: CometChat.Group;
}

function LoginPlaceholder() {
  return (
    <LoadingScreen/>
  );
}

/**
 * Main application component for the CometChat Builder.
 *
 * @param {CometChatHomeProps} props - The component props.
 * @returns {JSX.Element} The rendered CometChatApp component.
 */
function CometChatApp({ user, group }: CometChatHomeProps) {
  const [loggedInUser, setLoggedInUser] = useState<CometChat.User | null>(null);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const { styleFeatures } = useCometChatContext();

  useEffect(() => {
    // CometChat LoginListener expects an object with onLoginSuccess and onLogoutSuccess methods
    const loginListener: LoginListener = {
      loginSuccess: (user: CometChat.User) => {
        setLoggedInUser(user);
      },
      logoutSuccess: () => {
        setLoggedInUser(null);
      },
      loginFailure: () => {
        setLoggedInUser(null);
      },
    };

    // Set up listener for login state changes
    CometChat.addLoginListener("APP_LOGIN_LISTENER", loginListener);

    // Get initial logged in user
    const initialUser = CometChatUIKit.getLoggedinUser();
    if (initialUser) {
      initialUser.then((user) => setLoggedInUser(user));
    }

    // Get current user data from localStorage
    const userCredentials = localStorage.getItem("userCredentials");
    if (userCredentials) {
      try {
        const userData = JSON.parse(userCredentials);
        setCurrentUserData(userData);
      } catch (error) {
        console.error("Error parsing user credentials:", error);
      }
    }

    return () => {
      CometChat.removeLoginListener("APP_LOGIN_LISTENER");
    };
  }, []);

  // Function to get theme based on current settings
  function getTheme(): string {
    if (styleFeatures?.theme === "auto") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      return prefersDark ? "dark" : "light";
    }
    return styleFeatures?.theme || "light";
  }

  // Apply color customizations
  useEffect(() => {
    const applyColorChange = () => {
      const rootElement = document.documentElement;
      const brandColor = styleFeatures?.color?.brandColor || "#00f45e";

      rootElement.style.setProperty("--color-primary", brandColor);
      rootElement.style.setProperty("--color-primary-500", brandColor);

      // Update CSS custom properties for CometChat components
      const style = document.createElement("style");
      style.textContent = `
        :root {
          --cometchat-primary-color: ${brandColor} !important;
        }
        .cometchat-button--primary,
        .cometchat-button[data-variant="primary"] {
          background-color: ${brandColor} !important;
        }
        .cometchat-button--primary:hover,
        .cometchat-button[data-variant="primary"]:hover {
          background-color: ${brandColor}dd !important;
        }
      `;
      document.head.appendChild(style);
    };

    if (styleFeatures?.color?.brandColor) {
      applyColorChange();
    }
  }, [styleFeatures?.color?.brandColor]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "Enter" &&
        document.activeElement?.classList.contains(
          "cometchat-search-bar__input"
        )
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="CometChatApp">
      <div
        id={styleFeatures && `${styleFeatures?.theme}-theme`}
        data-theme={styleFeatures && getTheme()}
      >
        <AppContextProvider>
          {loggedInUser ? (
            <CometChatHome defaultGroup={group} defaultUser={user} />
          ) : (
            <LoginPlaceholder />
          )}
        </AppContextProvider>
      </div>
    </div>
  );
}

export default CometChatApp;
