import React from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/app/utils/auth";
import { Button } from "./Button";

interface LogoutButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = "ghost",
  size = "sm",
  className,
  showIcon = true,
  children,
}) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/welcome");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/auth/welcome");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
      leftIcon={
        showIcon ? (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        ) : undefined
      }
    >
      {children || "Logout"}
    </Button>
  );
};
