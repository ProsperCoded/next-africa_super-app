"use client";

import { useEffect, useState } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";

// Custom type to avoid conflict with CometChat.User
type ChatUser = {
  uid: string;
  name: string;
  avatar?: string;
};

export default function ContactsWithSearch() {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Convert CometChat.User to ChatUser
  const mapCometChatUser = (user: CometChat.User): ChatUser => ({
    uid: user.getUid(),
    name: user.getName() || "Unnamed",
    avatar: user.getAvatar() || "/default-avatar.png",
  });

  // Fetch conversations (default view)
const fetchConversations = async () => {
  setLoading(true);
  try {
    const request = new CometChat.ConversationsRequestBuilder()
      .setLimit(30)
      .build();

    const conversations = await request.fetchNext();

    const convoUsers: ChatUser[] = (conversations as any[])
      .filter((conv) => conv.conversationType === "user") // only users
      .map((conv) => conv.conversationWith as CometChat.User)
      .filter((u) => typeof u?.getUid === "function") // ensure method exists
      .map(mapCometChatUser);

    setUsers(convoUsers);
  } catch (error) {
    console.error("Error fetching conversations:", error);
  } finally {
    setLoading(false);
  }
};


  // Search users globally
  const searchUsers = async (keyword: string) => {
    setLoading(true);
    try {
      const request = new CometChat.UsersRequestBuilder()
        .setLimit(30)
        .setSearchKeyword(keyword)
        .build();

      const result = await request.fetchNext();
      const mappedUsers = result.map(mapCometChatUser);

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Watch search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      fetchConversations();
    } else {
      searchUsers(searchTerm);
    }
  }, [searchTerm]);

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search users"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {/* Loading */}
      {loading && <p className="text-gray-500">Loading...</p>}

      {/* Empty state */}
      {!loading && users.length === 0 && (
        <p className="text-gray-500 text-center">No users found</p>
      )}

      {/* User List */}
      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user.uid}
            className="flex items-center gap-3 p-2 border rounded cursor-pointer hover:bg-gray-100 transition"
            onClick={() => console.log("Clicked user:", user.uid)}
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-medium">{user.name}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
