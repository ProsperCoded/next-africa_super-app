/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import ContactsWithSearch from "./ContactsWithSearch";
import chatIcon from "../../assets/start-chat.svg";
import createGroupIcon from "../../assets/create-group.svg";
import logoutIcon from "../../assets/logout.svg";
import userIcon from "../../assets/users.svg";
import {
  Call,
  Conversation,
  Group,
  User,
  CometChat,
} from "@cometchat/chat-sdk-javascript";
import "../../styles/CometChatSelector/CometChatSelector.css";
import { CometChatJoinGroup } from "../CometChatJoinGroup/CometChatJoinGroup";
import CometChatCreateGroup from "../CometChatCreateGroup/CometChatCreateGroup";
import {
  CometChatButton,
  CometChatCallLogs,
  CometChatConversations,
  CometChatGroups,
  CometChatOption,
  CometChatUIKit,
  CometChatUIKitLoginListener,
  CometChatUsers,
  getLocalizedString,
  CometChatContextMenu,
  Placement,
} from "@cometchat/chat-uikit-react";

import { AppContext } from "../../context/AppContext";
import { useCometChatContext } from "../../context/CometChatContext";
import { CallLog } from "@cometchat/calls-sdk-javascript";
import { FloatingActionButton } from "@/app/components/ui/FloatingActionButton";
interface SelectorProps {
  group?: Group;
  showJoinGroup?: boolean;
  activeTab?: string;
  activeItem?: User | Group | Conversation | Call | CallLog;
  onSelectorItemClicked?: (
    input: User | Group | Conversation | Call,
    type: string
  ) => void;
  onProtectedGroupJoin?: (group: Group) => void;
  showCreateGroup?: boolean;
  setShowCreateGroup?: Dispatch<SetStateAction<boolean>>;
  onHide?: () => void;
  onNewChatClicked?: () => void;
  onAddContactClicked?: () => void;
  onFindGroupsClicked?: () => void;
  onGroupCreated?: (group: Group) => void;
  hideCreateGroupButton?: boolean;
}

interface UserCredentials {
  name: string;
}

const CometChatSelector = (props: SelectorProps) => {
  const {
    group,
    showJoinGroup,
    activeTab,
    activeItem,
    onSelectorItemClicked = () => {},
    onProtectedGroupJoin = () => {},
    showCreateGroup,
    setShowCreateGroup = () => {},
    onHide = () => {},
    onNewChatClicked = () => {},
    onAddContactClicked = () => {},
    onFindGroupsClicked = () => {},
    onGroupCreated = () => {},
    hideCreateGroupButton,
  } = props;

  const [loggedInUser, setLoggedInUser] = useState<CometChat.User | null>();
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const { setAppState } = useContext(AppContext);
  const { chatFeatures, callFeatures } = useCometChatContext();
  const getLoggedInUser = CometChatUIKitLoginListener.getLoggedInUser();

  useEffect(() => {
    setLoggedInUser(getLoggedInUser);
  }, [getLoggedInUser]);

  useEffect(() => {
    if (activeTab === "calls") {
      const toggleCallIcons = () => {
        const voiceCallIcons = document.getElementsByClassName(
          "cometchat-call-logs__list-item-trailing-view-audio"
        );
        const videoCallIcons = document.getElementsByClassName(
          "cometchat-call-logs__list-item-trailing-view-video"
        );
        if (callFeatures.voiceAndVideoCalling.oneOnOneVoiceCalling) {
          Array.from(voiceCallIcons).forEach((icon: any) => {
            icon.style.display = "";
          });
        } else {
          Array.from(voiceCallIcons).forEach((icon: any) => {
            icon.style.display = "none";
          });
        }

        if (callFeatures.voiceAndVideoCalling.oneOnOneVideoCalling) {
          Array.from(videoCallIcons).forEach((icon: any) => {
            icon.style.display = "";
          });
        } else {
          Array.from(videoCallIcons).forEach((icon: any) => {
            icon.style.display = "none";
          });
        }
      };

      if (
        document.getElementsByClassName(
          "cometchat-call-logs__list-item-trailing-view-audio"
        ).length === 0
      ) {
        const interval = setInterval(() => {
          const targetElement = document.getElementsByClassName(
            "cometchat-call-logs__list-item-trailing-view-audio"
          );
          if (targetElement.length > 0) {
            clearInterval(interval);
            toggleCallIcons();
          }
        }, 1);

        return () => clearInterval(interval);
      } else {
        toggleCallIcons();
      }
    }
  }, [callFeatures, activeTab]);

  const getOptions = (): CometChatOption[] => {
    const userCredentials = localStorage.getItem("userCredentials");
    let currentUserData: UserCredentials | null = null;

    try {
      if (userCredentials) {
        currentUserData = JSON.parse(userCredentials);
      }
    } catch (error) {
      console.error("Error parsing user credentials:", error);
    }

    return [
      // User info section
      new CometChatOption({
        id: "logged-in-user",
        title:
          currentUserData?.name ||
          (loggedInUser && loggedInUser.getName()) ||
          "User",
        iconURL: userIcon,
        // subtitle: currentUserData?.email || "",
        onClick: () => {
          // Could open user profile or settings
        },
      }),
      // Divider
      new CometChatOption({
        id: "divider-1",
        title: "",
        iconURL: "",
        // divider: true,
      }),
      new CometChatOption({
        id: "create-conversation",
        title: getLocalizedString("create_conversation"),
        iconURL: chatIcon,
        onClick: () => {
          onNewChatClicked();
          setShowOptionsMenu(false);
        },
      }),
      new CometChatOption({
        id: "add-contact",
        title: getLocalizedString("add_contact") || "Add Contact",
        iconURL: userIcon,
        onClick: () => {
          onAddContactClicked();
          setShowOptionsMenu(false);
        },
      }),
      new CometChatOption({
        id: "find-groups",
        title: getLocalizedString("find_groups") || "Find Groups",
        iconURL: createGroupIcon,
        onClick: () => {
          onFindGroupsClicked();
          setShowOptionsMenu(false);
        },
      }),
      // Divider
      new CometChatOption({
        id: "divider-2",
        title: "",
        iconURL: "",
        // divider: true,
      }),
      new CometChatOption({
        id: "log-out",
        title: getLocalizedString("log_out"),
        iconURL: logoutIcon,
        onClick: () => {
          logOut();
          setShowOptionsMenu(false);
        },
      }),
    ];
  };

  const logOut = () => {
    CometChatUIKit.logout()
      .then(() => {
        setLoggedInUser(null);
        setAppState({ type: "resetAppState" });

        // Trigger cross-tab logout event first (before clearing storage)
        localStorage.setItem("logout-trigger", Date.now().toString());

        // Clear ALL localStorage items related to user session
        localStorage.removeItem("userCredentials");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("user");

        // Clear any sessionStorage items as well
        sessionStorage.removeItem("signupData");
        sessionStorage.removeItem("otpData");

        // Clear all localStorage to ensure complete logout
        // This ensures no residual data remains that could cause issues
        try {
          localStorage.clear();
        } catch (error) {
          console.warn("Could not clear localStorage:", error);
        }

        // Force reload to ensure all state is reset
        window.location.href = "/auth/welcome";
      })
      .catch((error) => {
        console.error("Logout error:", error);
        // Even if CometChat logout fails, still clear local storage
        // Trigger cross-tab logout event first
        localStorage.setItem("logout-trigger", Date.now().toString());

        localStorage.removeItem("userCredentials");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("user");
        sessionStorage.removeItem("signupData");
        sessionStorage.removeItem("otpData");

        try {
          localStorage.clear();
        } catch (clearError) {
          console.warn("Could not clear localStorage:", clearError);
        }

        // Force redirect even on error
        window.location.href = "/auth/welcome";
      });
  };

  const conversationsHeaderView = () => {
    return (
      <div className="cometchat-conversations-header">
        <img src="/assets/logo-dark.png" alt="NEXT" style={{ height: "32px" }} />
        <div className="cometchat-conversations-header__actions">

          {/* Custom Options Menu */}
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg
                width="16"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#06023B"
                strokeWidth={4}
              >
                <circle cx="12" cy="24" r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="0" r="1" />
              </svg>
            </div>

            {/* Dropdown Menu */}
            {showOptionsMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "40px",
                  right: "0",
                  backgroundColor: "white",
                  border:
                    "1px solid var(--cometchat-border-color-default, #e8e8e8)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  minWidth: "200px",
                  zIndex: 1000,
                }}
              >
                {getOptions()
                  .filter(
                    (option) =>
                      option.id !== "divider-1" && option.id !== "divider-2"
                  )
                  .map((option) => (
                    <div
                      key={option.id}
                      onClick={() => {
                        const { onClick } = option;
                        if (onClick) {
                          onClick();
                        }
                      }}
                      style={{
                        padding: "12px 16px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        borderBottom:
                          option.id === "logged-in-user"
                            ? "1px solid var(--cometchat-border-color-light, #f5f5f5)"
                            : "none",
                        color:
                          option.id === "log-out"
                            ? "var(--cometchat-error-color, #f44649)"
                            : "var(--cometchat-text-color-primary, #141414)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--cometchat-background-color-02, #f9f9f9)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {option.iconURL && (
                        <img
                          src={option.iconURL}
                          alt=""
                          style={{
                            width: "20px",
                            height: "20px",
                            filter:
                              option.id === "log-out"
                                ? "brightness(0) saturate(100%) invert(25%) sepia(94%) saturate(3086%) hue-rotate(342deg) brightness(97%) contrast(94%)"
                                : "none",
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight:
                            option.id === "logged-in-user" ? "500" : "400",
                        }}
                      >
                        {option.title}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Add click outside handler to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        showOptionsMenu &&
        !target.closest(".cometchat-conversations-header__actions")
      ) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOptionsMenu]);

  const groupsHeaderView = () => {
    return (
      <div className="cometchat-groups-header">
        <div className="cometchat-groups-header__title">
          {getLocalizedString("group_title")}
        </div>
        {!hideCreateGroupButton && (
          <CometChatButton
            onClick={() => {
              setShowCreateGroup(true);
            }}
            iconURL={createGroupIcon}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <div className="w-full h-full relative">
      <FloatingActionButton
        onAddContact={onAddContactClicked}
        onFindGroups={onFindGroupsClicked}
        onStartConversation={() => {
          onNewChatClicked();
          setAppState({
            type: "updateSideComponent",
            payload: { type: "", visible: false },
          });
        }}
      />        

      {loggedInUser && (
        <>
          {showJoinGroup && group && (
            <CometChatJoinGroup
              group={group}
              onHide={onHide}
              onProtectedGroupJoin={(group) => onProtectedGroupJoin(group)}
            />
          )}
          {activeTab === "chats" ? (
            <CometChatConversations
              activeConversation={activeItem as Conversation}
              headerView={conversationsHeaderView()}
              onItemClick={(e) => {
                onSelectorItemClicked(e, "updateSelectedItem");
              }}
              hideUserStatus={
                chatFeatures &&
                !chatFeatures?.coreMessagingExperience?.userAndFriendsPresence
              }
              hideReceipts={
                chatFeatures &&
                !chatFeatures?.coreMessagingExperience
                  ?.messageDeliveryAndReadReceipts
              }
            />
          ) : activeTab === "calls" ? (
            <CometChatCallLogs
              activeCall={activeItem as Call}
              onItemClick={(e: Call) => {
                onSelectorItemClicked(e, "updateSelectedItemCall");
              }}
            />
          ) : activeTab === "users" ? (
            <ContactsWithSearch/>
          ) : activeTab === "groups" ? (
            <CometChatGroups
              activeGroup={activeItem as Group}
              headerView={groupsHeaderView()}
              onItemClick={(e) => {
                onSelectorItemClicked(e, "updateSelectedItemGroup");
              }}
            />
          ) : null}
          {showCreateGroup && (
            <>
              <CometChatCreateGroup
                setShowCreateGroup={setShowCreateGroup}
                onGroupCreated={(group) => onGroupCreated(group)}
              />
            </>
          )}
        </>
      )}
            </div>
    </>
  );
};

const MemoizedCometChatSelector = React.memo(CometChatSelector);

export { MemoizedCometChatSelector as CometChatSelector };
