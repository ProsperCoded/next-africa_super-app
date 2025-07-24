import React, { useState, useCallback } from "react";
import { CometChat, Group, GroupType } from "@cometchat/chat-sdk-javascript";
import {
  getLocalizedString,
  CometChatUIKitConstants,
  CometChatGroupEvents,
  CometChatUIKitLoginListener,
} from "@cometchat/chat-uikit-react";
import "./CometChatFindGroups.css";

interface CometChatFindGroupsProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupJoined?: (group: CometChat.Group) => void;
}

export const CometChatFindGroups: React.FC<CometChatFindGroupsProps> = ({
  isOpen,
  onClose,
  onGroupJoined,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CometChat.Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CometChat.Group | null>(
    null
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  // Search for public groups
  const searchGroups = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Search for groups with keyword
      const searchRequest = new CometChat.GroupsRequestBuilder()
        .setLimit(20)
        .setSearchKeyword(term)
        .build();

      const groups = await searchRequest.fetchNext();

      // Filter to show only public groups and groups we haven't joined
      const publicGroups = groups.filter(
        (group) => group.getType() === CometChatUIKitConstants.GroupTypes.public
      );

      setSearchResults(publicGroups);
    } catch (error) {
      console.error("Error searching groups:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchGroups(value);
  };

  const handleGroupJoin = async (group: CometChat.Group) => {
    if (group.getHasJoined()) {
      // Already joined, just notify
      setSelectedGroup(group);
      setShowSuccess(true);
      if (onGroupJoined) {
        onGroupJoined(group);
      }

      setTimeout(() => {
        setShowSuccess(false);
        handleClose();
      }, 2000);
      return;
    }

    setJoiningGroupId(group.getGuid());

    try {
      // Join the public group
      const joinedGroup = await CometChat.joinGroup(
        group.getGuid(),
        group.getType() as GroupType
      );

      // Update group status
      joinedGroup.setHasJoined(true);
      joinedGroup.setScope(
        CometChatUIKitConstants.groupMemberScope.participant
      );

      // Emit group joined event
      const loggedInUser = CometChatUIKitLoginListener.getLoggedInUser();
      setTimeout(() => {
        CometChatGroupEvents.ccGroupMemberJoined.next({
          joinedGroup: joinedGroup,
          joinedUser: loggedInUser!,
        });
      }, 100);

      setSelectedGroup(joinedGroup);
      setShowSuccess(true);

      // Call the callback if provided
      if (onGroupJoined) {
        onGroupJoined(joinedGroup);
      }

      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Error joining group:", error);
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedGroup(null);
    setShowSuccess(false);
    setJoiningGroupId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="cometchat-find-groups-overlay">
      <div className="cometchat-find-groups-modal">
        <div className="cometchat-find-groups-header">
          <h2 className="cometchat-find-groups-title">
            {getLocalizedString("find_groups") || "Find Groups"}
          </h2>
          <button
            className="cometchat-find-groups-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {showSuccess && selectedGroup ? (
          <div className="cometchat-find-groups-success">
            <div className="cometchat-find-groups-success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>Successfully Joined!</h3>
            <p>
              You've joined <strong>{selectedGroup.getName()}</strong>
            </p>
            <p className="cometchat-find-groups-hint">
              Go to the <strong>Groups</strong> tab to start chatting with the
              group members.
            </p>
          </div>
        ) : (
          <>
            <div className="cometchat-find-groups-content">
              <div className="cometchat-find-groups-search">
                <label htmlFor="groupSearch">
                  {getLocalizedString("search_groups") ||
                    "Search for public groups by name"}
                </label>
                <input
                  id="groupSearch"
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Enter group name..."
                  className="cometchat-find-groups-input"
                  style={{
                    color: "#111827",
                    backgroundColor: "#ffffff",
                    WebkitTextFillColor: "#111827",
                  }}
                />
              </div>

              <div className="cometchat-find-groups-results">
                {isLoading && (
                  <div className="cometchat-find-groups-loading">
                    <div className="cometchat-find-groups-spinner"></div>
                    <p>Searching for groups...</p>
                  </div>
                )}

                {!isLoading && searchTerm && searchResults.length === 0 && (
                  <div className="cometchat-find-groups-empty">
                    <p>No public groups found with "{searchTerm}"</p>
                    <p className="cometchat-find-groups-empty-hint">
                      Try searching with different keywords or check if the
                      group is public.
                    </p>
                  </div>
                )}

                {!isLoading && searchResults.length > 0 && (
                  <div className="cometchat-find-groups-list">
                    <h4>Public Groups ({searchResults.length})</h4>
                    {searchResults.map((group) => (
                      <div
                        key={group.getGuid()}
                        className="cometchat-find-groups-group"
                      >
                        <div className="cometchat-find-groups-group-avatar">
                          <img
                            src={
                              group.getIcon() ||
                              `https://ui-avatars.com/api/?name=${group.getName()}&background=00f45e&color=fff&rounded=true`
                            }
                            alt={group.getName()}
                          />
                        </div>
                        <div className="cometchat-find-groups-group-info">
                          <h5>{group.getName()}</h5>
                          <p>{group.getMembersCount()} members</p>
                          <span className="cometchat-find-groups-group-type">
                            {group.getType() ===
                            CometChatUIKitConstants.GroupTypes.public
                              ? "Public"
                              : "Private"}
                          </span>
                        </div>
                        <button
                          className={`cometchat-find-groups-join-btn ${
                            group.getHasJoined() ? "joined" : ""
                          }`}
                          onClick={() => handleGroupJoin(group)}
                          disabled={joiningGroupId === group.getGuid()}
                        >
                          {joiningGroupId === group.getGuid() ? (
                            <div className="cometchat-find-groups-btn-spinner"></div>
                          ) : group.getHasJoined() ? (
                            "Joined"
                          ) : (
                            "Join"
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!searchTerm && (
                  <div className="cometchat-find-groups-instructions">
                    <div className="cometchat-find-groups-instructions-icon">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11ZM21 8V14M18 11H24"
                          stroke="#6B7280"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h3>Discover Public Groups</h3>
                    <p>
                      Search for public groups to join communities and connect
                      with people who share your interests.
                    </p>
                    <ul>
                      <li>Search by group name or keywords</li>
                      <li>Join public groups instantly</li>
                      <li>Discover active communities</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
