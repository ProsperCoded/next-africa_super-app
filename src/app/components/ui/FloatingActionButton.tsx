import React, { useState } from "react";
import { cn } from "@/app/lib/utils";

interface FloatingActionMenuProps {
  onAddContact: () => void;
  onFindGroups: () => void;
  onStartConversation: () => void;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionMenuProps> = ({
  onAddContact,
  onFindGroups,
  onStartConversation,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Action Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg py-2 min-w-[200px] animate-slide-up">
          <button
            onClick={() => handleAction(onStartConversation)}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            Start Conversation
          </button>

          <button
            onClick={() => handleAction(onAddContact)}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700"
          >
            <div className="w-8 h-8 bg-secondary-900 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            Add Contact
          </button>

          <button
            onClick={() => handleAction(onFindGroups)}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700"
          >
            <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            Find Groups
          </button>
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={toggleMenu}
        className={cn(
          "w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg",
          "flex items-center justify-center transition-all duration-200",
          "hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          isOpen && "rotate-45"
        )}
      >
        <svg
          className={cn(
            "w-6 h-6 transition-transform duration-200",
            isOpen && "rotate-45"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
