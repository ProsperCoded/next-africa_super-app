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
          <p className="text-sm text-gray-500">
            Africa’s <span className="font-bold"> fastest </span>app with everything you need for daily operations   
          </p>
        </div>
              <Link
                href="/auth/signup"
                className="w-full bg-[#05F04B] text-black py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                Get Started
              </Link>
      </div>
      </div>
    );
  }
