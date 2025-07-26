"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Welcome() {
  const [activeTab, setActiveTab] = useState<"signup" | "login">("signup");

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and branding */}
        <div className="text-center">
          <div className="mx-auto bg-[#06023B] rounded-full w-32 h-32 relative flex justify-center mb-4">
            <Image
              src="/assets/logo-light.png"
              alt="AFRIXA Logo"
              width={50}
              height={50}
              // fill
              className="object-contain "
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AFRIXA</h1>
          <p className="text-lg text-gray-600 mb-2">Africa's Super-App</p>
          <p className="text-sm text-gray-500">
            Secure messaging, voice & video calling, and more
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
              activeTab === "signup"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
              activeTab === "login"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Log In
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeTab === "signup" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Create Account
                </h2>
                <p className="text-gray-600">
                  Join millions of users across Africa on NEXT
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">
                    What you'll get:
                  </h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Secure end-to-end messaging</li>
                    <li>• High-quality voice & video calls</li>
                    <li>• Group chats and conferences</li>
                    <li>• Future: Wallet, payments & more</li>
                  </ul>
                </div>
              </div>

              <Link
                href="/auth/signup"
                className="w-full bg-[#05F04B] text-black py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                Get Started
              </Link>

              <p className="text-xs text-center text-gray-500">
                By signing up, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600">
                  Sign in to continue your conversations
                </p>
              </div>

              <Link
                href="/auth/login"
                className="w-full bg-[#05F04B] text-black py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Sign In
              </Link>

              <div className="text-center">
                <span className="text-gray-500 text-sm">
                  Don't have an account?{" "}
                </span>
                <button
                  onClick={() => setActiveTab("signup")}
                  className="text-green-600 text-sm font-medium hover:text-green-700"
                >
                  Sign up
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400">
          <p>Powered by CometChat • Made for Africa</p>
        </div>
      </div>
    </div>
  );
}
