"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailExists, setEmailExists] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
    if (name === "email" && emailExists) setEmailExists(false);
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      return "+234" + cleaned.substring(1);
    } else if (cleaned.startsWith("234")) {
      return "+" + cleaned;
    } else if (cleaned.startsWith("+234")) {
      return cleaned;
    } else {
      return "+234" + cleaned;
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return "First name is required";
    if (!formData.lastName.trim()) return "Last name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.phone.trim()) return "Phone number is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Please enter a valid email";

    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    const formattedPhone = formatPhoneNumber(formData.phone);
    if (!phoneRegex.test(formattedPhone))
      return "Please enter a valid Nigerian phone number";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // First, check if email already exists
      console.log("Checking if email exists before signup...");
      const emailCheckResponse = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase(),
        }),
      });

      const emailCheckData = await emailCheckResponse.json();

      if (!emailCheckResponse.ok) {
        console.error("Email check failed:", emailCheckData);
        setError("Unable to verify email. Please try again.");
        return;
      }

      if (emailCheckData.exists) {
        console.log("Email already exists, showing error");
        setError("An account with this email already exists.");
        setEmailExists(true);
        return;
      }

      console.log("Email is available, proceeding with OTP...");
      setEmailExists(false);

      // Email doesn't exist, proceed with OTP
      const formattedPhone = formatPhoneNumber(formData.phone);
      const name = `${formData.firstName} ${formData.lastName}`.trim();

      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase(),
          phone: formattedPhone,
          name: name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store form data and OTP in sessionStorage for verification
        sessionStorage.setItem(
          "signupData",
          JSON.stringify({
            ...formData,
            phone: formattedPhone,
            name: name,
          })
        );

        // Store OTP data for verification (MVP lazy solution)
        sessionStorage.setItem(
          "otpData",
          JSON.stringify({
            otp: data.otp,
            generatedAt: data.generatedAt,
            email: formData.email.toLowerCase(),
            phone: data.phone,
          })
        );

        router.push(
          `/auth/verify-otp?email=${encodeURIComponent(
            formData.email
          )}&type=signup`
        );
      } else {
        setError(data.error || "Failed to send verification code");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Something went wrong. Please try again.");
      setEmailExists(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-6 sm:px-6 sm:py-8">
        <div className="text-center">
          <div className="mx-auto mb-6">
            <Image
              src="/assets/logo-name.png"
              alt="NEXT"
              width={120}
              height={48}
              className="h-12 w-auto object-contain mx-auto"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 sm:text-4xl">
            Join NEXT
          </h1>
          <p className="text-gray-600 text-lg">
            Africa's first secure super-app
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 flex items-start justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                  {emailExists && (
                    <div className="mt-2">
                      <Link
                        href="/auth/login"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Sign in instead →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white transition-all duration-200"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white transition-all duration-200"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white transition-all duration-200"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white transition-all duration-200"
                  placeholder="+234 801 234 5678"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  We'll send a verification code to this number
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending Code...
                  </span>
                ) : (
                  "Send Verification Code"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <span className="text-gray-500 text-sm">
                Already have an account?{" "}
              </span>
              <Link
                href="/auth/login"
                className="text-green-600 text-sm font-semibold hover:text-green-700 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/welcome"
              className="text-gray-500 text-sm hover:text-gray-700 inline-flex items-center transition-colors"
            >
              ← Back to welcome
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
