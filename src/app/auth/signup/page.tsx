"use client";
import { useState } from "react";
import SignUp from "@/app/components/SignUp";
import Login from "@/app/components/Login";
import Image from "next/image";
export default function Page() {
  const [activeTab, setActiveTab] = useState<"signup" | "login">("signup");

  return (
    <div className="w-full max-w-md mx-auto p-2">
      <div >
        <Image
          src="/assets/logo-name.svg"
          alt="AFRIXA"
          width={120}
          height={48}
          className="h-12 w-auto object-contain mx-auto"
          priority
        />
        <div className="text-center mt-4 mb-8">
          <p className="text-gray-600 text-lg">Africa’s <span className="font-bold">fastest</span>  app with everything you need for daily operations   </p>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab("signup")}
          className={`flex-1 py-2 text-center font-medium transition ${
            activeTab === "signup"
              ? "border-b-2 border-b-[#06023B] text-[#06023B]"
              : "text-gray-500 hover:text-[#06023B]"
          }`}
        >
          Sign Up
        </button>
        <button
          onClick={() => setActiveTab("login")}
          className={`flex-1 py-2 text-center font-medium transition ${
            activeTab === "login"
              ? "border-b-2 border-b-[#06023B] text-[#06023B]"
              : "text-gray-500 hover:text-[#06023B]"
          }`}
        >
          Login
        </button>
      </div>

      {/* Content */}
      <div>{activeTab === "signup" ? <SignUp /> : <Login />}</div>
    </div>
  );
}
