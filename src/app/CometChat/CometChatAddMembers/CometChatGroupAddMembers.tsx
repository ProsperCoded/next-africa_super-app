import React, { useState, useCallback } from "react";
import { CometChat, Group } from "@cometchat/chat-sdk-javascript";
import {
  getLocalizedString,
  CometChatUsers,
  CometChatUIKitConstants,
  CometChatGroupEvents,
  CometChatUIKitLoginListener,
} from "@cometchat/chat-uikit-react";
import "./CometChatGroupAddMembers.css";

interface CometChatGroupAddMembersProps {
  isOpen: boolean;
  onClose: () => void;
  group: CometChat.Group;
  onMembersAdded?: (members: CometChat.User[]) => void;
}

export const CometChatGroupAddMembers: React.FC<
  CometChatGroupAddMembersProps
> = ({ isOpen, onClose, group, onMembersAdded }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CometChat.User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<CometChat.User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Search for users to add to the group
  const searchUsers = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Search for users with keyword
        const searchRequest = new CometChat.UsersRequestBuilder()
          .setLimit(20)
          .setSearchKeyword(term)
          .build();

        const users = await searchRequest.fetchNext();

        // Filter out users who are already in the group
        const groupMembers = await CometChat.getGroupMembers(
          group.getGuid(),
          100
        );
        const memberUIDs = groupMembers.map((member) => member.getUid());
        const availableUsers = users.filter(
          (user) => !memberUIDs.includes(user.getUid())
        );

        setSearchResults(availableUsers);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [group]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchUsers(value);
  };

  const toggleUserSelection = (user: CometChat.User) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.getUid() === user.getUid());
      if (isSelected) {
        return prev.filter((u) => u.getUid() !== user.getUid());
      } else {
        return [...prev, user];
      }
    });
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;

    setIsAdding(true);
    try {
      // Create group members from selected users
      const groupMembers = selectedUsers.map((user) => {
        const groupMember = new CometChat.GroupMember(
          user.getUid(),
          CometChatUIKitConstants.groupMemberScope.participant
        );
        groupMember.setName(user.getName());
        groupMember.setGuid(group.getGuid());
        groupMember.setAvatar(user.getAvatar());
        return groupMember;
      });

      // Add members to the group
      await CometChat.addMembersToGroup(group.getGuid(), groupMembers, []);

      // Emit group member added events
      selectedUsers.forEach((user) => {
        const loggedInUser = CometChatUIKitLoginListener.getLoggedInUser();
        setTimeout(() => {
          CometChatGroupEvents.ccGroupMemberAdded.next({
            group: group,
            addedBy: loggedInUser!,
            userAdded: user,
          });
        }, 100);
      });

      setShowSuccess(true);

      // Call the callback if provided
      if (onMembersAdded) {
        onMembersAdded(selectedUsers);
      }

      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Error adding members:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedUsers([]);
    setShowSuccess(false);
    setIsAdding(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="cometchat-group-add-members-overlay">
      <div className="cometchat-group-add-members-modal">
        <div className="cometchat-group-add-members-header">
          <h2 className="cometchat-group-add-members-title">
            Add Members to {group.getName()}
          </h2>
          <button
            className="cometchat-group-add-members-close"
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

        {showSuccess ? (
          <div className="cometchat-group-add-members-success">
            <div className="cometchat-group-add-members-success-icon">
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
            <h3>Members Added Successfully!</h3>
            <p>
              Added {selectedUsers.length} member
              {selectedUsers.length > 1 ? "s" : ""} to{" "}
              <strong>{group.getName()}</strong>
            </p>
          </div>
        ) : (
          <>
            <div className="cometchat-group-add-members-content">
              <div className="cometchat-group-add-members-search">
                <label htmlFor="userSearch">
                  Search for users to add to your group
                </label>
                <input
                  id="userSearch"
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Enter username, email, or name..."
                  className="cometchat-group-add-members-input"
                  style={{
                    color: "#111827",
                    backgroundColor: "#ffffff",
                    WebkitTextFillColor: "#111827",
                  }}
                />
              </div>

              {selectedUsers.length > 0 && (
                <div className="cometchat-group-add-members-selected">
                  <h4>Selected Users ({selectedUsers.length})</h4>
                  <div className="cometchat-group-add-members-selected-list">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.getUid()}
                        className="cometchat-group-add-members-selected-user"
                      >
                        <img
                          src={
                            user.getAvatar() ||
                            `https://ui-avatars.com/api/?name=${user.getName()}&background=00f45e&color=fff`
                          }
                          alt={user.getName()}
                        />
                        <span>{user.getName()}</span>
                        <button onClick={() => toggleUserSelection(user)}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M18 6L6 18M6 6L18 18"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="cometchat-group-add-members-results">
                {isLoading && (
                  <div className="cometchat-group-add-members-loading">
                    <div className="cometchat-group-add-members-spinner"></div>
                    <p>Searching for users...</p>
                  </div>
                )}

                {!isLoading && searchTerm && searchResults.length === 0 && (
                  <div className="cometchat-group-add-members-empty">
                    <p>No users found with "{searchTerm}"</p>
                    <p className="cometchat-group-add-members-empty-hint">
                      Try searching with different keywords or check if they're
                      already in the group.
                    </p>
                  </div>
                )}

                {!isLoading && searchResults.length > 0 && (
                  <div className="cometchat-group-add-members-list">
                    <h4>Available Users ({searchResults.length})</h4>
                    {searchResults.map((user) => {
                      const isSelected = selectedUsers.some(
                        (u) => u.getUid() === user.getUid()
                      );
                      return (
                        <div
                          key={user.getUid()}
                          className={`cometchat-group-add-members-user ${
                            isSelected ? "selected" : ""
                          }`}
                          onClick={() => toggleUserSelection(user)}
                        >
                          <div className="cometchat-group-add-members-user-avatar">
                            <img
                              src={
                                user.getAvatar() ||
                                `https://ui-avatars.com/api/?name=${user.getName()}&background=00f45e&color=fff`
                              }
                              alt={user.getName()}
                            />
                          </div>
                          <div className="cometchat-group-add-members-user-info">
                            <h5>{user.getName()}</h5>
                            <p>@{user.getUid()}</p>
                            {user.getStatus() ===
                              CometChatUIKitConstants.userStatusType.online && (
                              <span className="cometchat-group-add-members-user-status online">
                                Online
                              </span>
                            )}
                          </div>
                          <div className="cometchat-group-add-members-user-checkbox">
                            {isSelected ? (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <circle cx="12" cy="12" r="10" fill="#00f45e" />
                                <path
                                  d="M9 12L11 14L15 10"
                                  stroke="white"
                                  strokeWidth="2"
                                />
                              </svg>
                            ) : (
                              <div className="cometchat-group-add-members-user-checkbox-empty"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!searchTerm && (
                  <div className="cometchat-group-add-members-instructions">
                    <div className="cometchat-group-add-members-instructions-icon">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                          stroke="#6B7280"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                          stroke="#6B7280"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M19 8V14M16 11H22"
                          stroke="#6B7280"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h3>Add New Members</h3>
                    <p>
                      Search for users to invite them to your group. You can
                      select multiple users and add them all at once.
                    </p>
                    <ul>
                      <li>Search by username, email, or name</li>
                      <li>Select multiple users</li>
                      <li>Users already in the group won't appear</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <div className="cometchat-group-add-members-footer">
                <button
                  className="cometchat-group-add-members-cancel-btn"
                  onClick={handleClose}
                  disabled={isAdding}
                >
                  Cancel
                </button>
                <button
                  className="cometchat-group-add-members-add-btn"
                  onClick={handleAddMembers}
                  disabled={isAdding || selectedUsers.length === 0}
                >
                  {isAdding ? (
                    <>
                      <div className="cometchat-group-add-members-btn-spinner"></div>
                      Adding...
                    </>
                  ) : (
                    `Add ${selectedUsers.length} Member${
                      selectedUsers.length > 1 ? "s" : ""
                    }`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
