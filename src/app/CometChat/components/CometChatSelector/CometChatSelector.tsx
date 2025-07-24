/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import chatIcon from "../../assets/start_chat.svg";
import createGroupIcon from "../../assets/create-group.svg";
import logoutIcon from "../../assets/logout.svg";
import userIcon from "../../assets/user.svg";
import {
  Call,
  Conversation,
  Group,
  User,
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
    let currentUserData = null;

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
        subtitle: currentUserData?.email || "",
        onClick: () => {
          // Could open user profile or settings
        },
      }),
      // Divider
      new CometChatOption({
        id: "divider-1",
        title: "",
        iconURL: "",
        divider: true,
      }),
      new CometChatOption({
        id: "create-conversation",
        title: getLocalizedString("create_conversation"),
        iconURL: chatIcon,
        onClick: () => {
          onNewChatClicked();
        },
      }),
      new CometChatOption({
        id: "add-contact",
        title: getLocalizedString("add_contact") || "Add Contact",
        iconURL: userIcon,
        onClick: () => {
          onAddContactClicked();
        },
      }),
      new CometChatOption({
        id: "find-groups",
        title: getLocalizedString("find_groups") || "Find Groups",
        iconURL: createGroupIcon,
        onClick: () => {
          onFindGroupsClicked();
        },
      }),
      // Divider
      new CometChatOption({
        id: "divider-2",
        title: "",
        iconURL: "",
        divider: true,
      }),
      new CometChatOption({
        id: "log-out",
        title: getLocalizedString("log_out"),
        iconURL: logoutIcon,
        onClick: () => {
          logOut();
        },
      }),
    ];
  };

  const logOut = () => {
    CometChatUIKit.logout()
      .then(() => {
        setLoggedInUser(null);
        setAppState({ type: "resetAppState" });
      })
      .catch((error) => {
        console.error("error", error);
      });
  };

  const conversationsHeaderView = () => {
    return (
      <div className="cometchat-conversations-header">
        <div className="cometchat-conversations-header__title">
          {getLocalizedString("chats")}
        </div>
        <div className="cometchat-conversations-header__actions">
          {/* Prominent Start Chat Button */}
          <CometChatButton
            onClick={() => {
              onNewChatClicked();
            }}
            iconURL={chatIcon}
            text="New"
            style={{
              background: "var(--color-primary)",
              color: "white",
              borderRadius: "20px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: "500",
              border: "none",
              marginRight: "8px",
            }}
          />
          <CometChatContextMenu
            closeOnOutsideClick={true}
            placement={Placement.left}
            data={getOptions() as CometChatOption[]}
            topMenuSize={1}
            onOptionClicked={(e: CometChatOption) => {
              const { onClick } = e;
              if (onClick) {
                onClick();
              }
            }}
            moreIconURL=""
            customIcon={
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  background: "var(--color-primary)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </div>
            }
          />
        </div>
      </div>
    );
  };

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
            <CometChatUsers
              activeUser={activeItem as User}
              onItemClick={(e) => {
                onSelectorItemClicked(e, "updateSelectedItemUser");
              }}
              hideUserStatus={
                chatFeatures &&
                !chatFeatures?.coreMessagingExperience?.userAndFriendsPresence
              }
            />
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
    </>
  );
};

const MemoizedCometChatSelector = React.memo(CometChatSelector);

export { MemoizedCometChatSelector as CometChatSelector };
