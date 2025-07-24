/* eslint-disable react/no-unescaped-entities */
import "./styles/CometChatApp.css";
import { AppContextProvider } from "./context/AppContext";
import { CometChatHome } from "./components/CometChatHome/CometChatHome";
import React, { useEffect, useState } from "react";
import { useCometChatContext } from "./context/CometChatContext";
import { fontSizes } from "./styleConfig";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import useSystemColorScheme from "./customHooks";
import { generateExtendedColors } from "./utils/utils";
import { CometChatUIKit } from "@cometchat/chat-uikit-react";
import "@cometchat/chat-uikit-react/css-variables.css";
import LogoutButton from "../components/LogoutButton";
import { getCurrentUser } from "../utils/auth";

interface CometChatHomeProps {
  /** Default user for the chat application (optional). */
  user?: CometChat.User;
  /** Default group for the chat application (optional). */
  group?: CometChat.Group;
}

function LoginPlaceholder() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f7f7f7",
      }}
    >
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>Welcome to NEXT Chat</h2>
        <p>Please authenticate to continue</p>
      </div>
    </div>
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
  const { styleFeatures, setStyleFeatures } = useCometChatContext();
  const [currentUserData, setCurrentUserData] = useState(getCurrentUser());

  const systemTheme = useSystemColorScheme();

  /**
   * Effect to handle login and logout listeners
   */
  useEffect(() => {
    CometChat.addLoginListener(
      "runnable-sample-app",
      new CometChat.LoginListener({
        loginSuccess: (user: CometChat.User) => {
          setLoggedInUser(user);
        },
        logoutSuccess: () => {
          setLoggedInUser(null);
        },
      })
    );

    return () => CometChat.removeLoginListener("runnable-sample-app");
  }, []);

  /**
   * Fetches the currently logged-in CometChat user and updates the state.
   * Runs once on component mount.
   */
  useEffect(() => {
    CometChatUIKit.getLoggedinUser().then((user: CometChat.User | null) => {
      if (user) {
        setLoggedInUser(user);
      } else {
        setLoggedInUser(null);
      }
    });
  }, []);

  /**
   * Converts a hex color code to an RGBA format with a given opacity.
   *
   * @param {string} hex - The hex color code.
   * @param {number} alpha - The opacity value (0 to 1).
   * @returns {string} The RGBA color string.
   */
  const hexToRGBA = (hex: string, alpha: number) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  useEffect(() => {
    const rootElement = document.documentElement;

    const primaryColor = styleFeatures.color.brandColor;

    // Apply primary color
    rootElement.style.setProperty("--cc-primary", primaryColor);

    const primaryTextLight = styleFeatures.color.primaryTextLight;
    const secondaryTextLight = styleFeatures.color.secondaryTextLight;
    const primaryTextDark = styleFeatures.color.primaryTextDark;
    const secondaryTextDark = styleFeatures.color.secondaryTextDark;

    // Apply current theme
    const theme = styleFeatures.theme;
    rootElement.setAttribute("data-theme", theme);

    // Apply text colors
    if (theme === "light") {
      rootElement.style.setProperty("--cc-text-primary", primaryTextLight);
      rootElement.style.setProperty("--cc-text-secondary", secondaryTextLight);
    } else {
      rootElement.style.setProperty("--cc-text-primary", primaryTextDark);
      rootElement.style.setProperty("--cc-text-secondary", secondaryTextDark);
    }

    // Apply font
    const font = styleFeatures.typography.font;
    rootElement.style.setProperty("--cc-font-family", font);

    // Apply font size
    const size = styleFeatures.typography.size;
    const sizeConfig = fontSizes[size as keyof typeof fontSizes];
    if (sizeConfig) {
      Object.entries(sizeConfig).forEach(([key, value]) => {
        rootElement.style.setProperty(`--cc-${key}`, value as string);
      });
    }
  }, [styleFeatures]);

  useEffect(() => {
    if (styleFeatures.theme === "auto") {
      const rootElement = document.documentElement;
      rootElement.setAttribute("data-theme", systemTheme);
    }
  }, [systemTheme, styleFeatures.theme]);

  // Canvas color recoloring function for audio messages (if brand color is changed)
  useEffect(() => {
    const recolorCanvasContent = (canvas: HTMLCanvasElement) => {
      if (!canvas.getContext) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const targetColor = hexToRGBA(styleFeatures.color.brandColor, 1);
      const [targetR, targetG, targetB] = targetColor
        .match(/\d+/g)!
        .map(Number);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Check if this pixel is not transparent and is part of the waveform (dark colors)
        if (a > 0 && r < 100 && g < 100 && b < 100) {
          data[i] = targetR; // Red channel
          data[i + 1] = targetG; // Green channel
          data[i + 2] = targetB; // Blue channel
          // Keep original alpha
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };

    // Recursive function to find and recolor canvases inside Shadow DOM and nested elements
    const findAndRecolorCanvases = (element: Element | ShadowRoot) => {
      if (element instanceof Element && element.matches("canvas")) {
        recolorCanvasContent(element as HTMLCanvasElement);
      }

      // Search within child elements and Shadow DOM recursively
      element.childNodes.forEach((child) => {
        if (child instanceof Element) {
          findAndRecolorCanvases(child);
          if (child.shadowRoot) {
            findAndRecolorCanvases(child.shadowRoot);
          }
        }
      });
    };
    // Apply color change to all canvases inside elements with the target class
    const applyColorChange = () => {
      document
        .querySelectorAll(".cometchat-audio-bubble-incoming")
        .forEach((parentDiv) => {
          findAndRecolorCanvases(parentDiv);
        });
    };
    setTimeout(applyColorChange, 100); // Wait for rendering
  }, [styleFeatures.color.brandColor]);

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
      {/* User info and logout header */}
      {loggedInUser && currentUserData && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            zIndex: 1000,
            background: "white",
            padding: "10px 20px",
            borderBottomLeftRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
              {currentUserData.name}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {currentUserData.email}
            </div>
          </div>
          <LogoutButton className="text-xs" />
        </div>
      )}

      <AppContextProvider>
        {loggedInUser ? (
          <CometChatHome defaultGroup={group} defaultUser={user} />
        ) : (
          <LoginPlaceholder />
        )}
      </AppContextProvider>
    </div>
  );
}

export default CometChatApp;
