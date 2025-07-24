import React, { useState, useCallback } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import {
  getLocalizedString,
  CometChatUIKitConstants,
} from "@cometchat/chat-uikit-react";
import "./CometChatAddContact.css";

interface CometChatAddContactProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded?: (user: CometChat.User) => void;
}

export const CometChatAddContact: React.FC<CometChatAddContactProps> = ({
  isOpen,
  onClose,
  onContactAdded,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CometChat.User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CometChat.User | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Custom search function for username/phone
  const searchUsers = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // First try to get user by exact UID
      try {
        const userByUID = await CometChat.getUser(term);
        if (userByUID) {
          setSearchResults([userByUID]);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        // User not found by UID, continue with general search
      }

      // If not found by UID, do a general user search
      const searchRequest = new CometChat.UsersRequestBuilder()
        .setLimit(20)
        .setSearchKeyword(term)
        .build();

      const users = await searchRequest.fetchNext();
      setSearchResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchUsers(value);
  };

  const handleUserSelect = (user: CometChat.User) => {
    setSelectedUser(user);
    setShowSuccess(true);

    // Call the callback if provided
    if (onContactAdded) {
      onContactAdded(user);
    }

    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedUser(null);
    setShowSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="cometchat-add-contact-overlay">
      <div className="cometchat-add-contact-modal">
        <div className="cometchat-add-contact-header">
          <h2 className="cometchat-add-contact-title">
            {getLocalizedString("add_contact") || "Add Contact"}
          </h2>
          <button
            className="cometchat-add-contact-close"
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

        {showSuccess && selectedUser ? (
          <div className="cometchat-add-contact-success">
            <div className="cometchat-add-contact-success-icon">
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
            <h3>Contact Added!</h3>
            <p>
              <strong>{selectedUser.getName()}</strong> has been added to your
              contacts.
            </p>
            <p className="cometchat-add-contact-hint">
              To send them a message, go to the <strong>Chats</strong> tab and
              click
              <strong> "Start new conversation"</strong>.
            </p>
          </div>
        ) : (
          <>
            <div className="cometchat-add-contact-content">
              <div className="cometchat-add-contact-search">
                <label htmlFor="userSearch">
                  {getLocalizedString("search_users") ||
                    "Search by username, email, or phone"}
                </label>
                <input
                  id="userSearch"
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Enter username, email, or phone number..."
                  className="cometchat-add-contact-input"
                />
              </div>

              <div className="cometchat-add-contact-results">
                {isLoading && (
                  <div className="cometchat-add-contact-loading">
                    <div className="cometchat-add-contact-spinner"></div>
                    <p>Searching...</p>
                  </div>
                )}

                {!isLoading && searchTerm && searchResults.length === 0 && (
                  <div className="cometchat-add-contact-empty">
                    <p>No users found with "{searchTerm}"</p>
                    <p className="cometchat-add-contact-empty-hint">
                      Try searching with their exact username, email, or phone
                      number.
                    </p>
                  </div>
                )}

                {!isLoading && searchResults.length > 0 && (
                  <div className="cometchat-add-contact-list">
                    <h4>Search Results</h4>
                    {searchResults.map((user) => (
                      <div
                        key={user.getUid()}
                        className="cometchat-add-contact-user"
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="cometchat-add-contact-user-avatar">
                          <img
                            src={
                              user.getAvatar() ||
                              `https://ui-avatars.com/api/?name=${user.getName()}&background=00f45e&color=fff`
                            }
                            alt={user.getName()}
                          />
                        </div>
                        <div className="cometchat-add-contact-user-info">
                          <h5>{user.getName()}</h5>
                          <p>@{user.getUid()}</p>
                          {user.getStatus() ===
                            CometChatUIKitConstants.userStatusType.online && (
                            <span className="cometchat-add-contact-user-status online">
                              Online
                            </span>
                          )}
                        </div>
                        <button className="cometchat-add-contact-add-btn">
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!searchTerm && (
                  <div className="cometchat-add-contact-instructions">
                    <div className="cometchat-add-contact-instructions-icon">
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
                      </svg>
                    </div>
                    <h3>Find and Add Contacts</h3>
                    <p>
                      Search for users by their username, email, or phone number
                      to add them to your contacts.
                    </p>
                    <ul>
                      <li>Enter their exact username (e.g., john_doe)</li>
                      <li>Search by email address</li>
                      <li>Use their phone number</li>
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
