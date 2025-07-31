"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";


// ------------------- Phone Input Component -------------------

const countries = [
  { name: "Nigeria", code: "+234", flag: "🇳🇬", digits: 10, format: "XXX XXX XXXX" },
  { name: "Ghana", code: "+233", flag: "🇬🇭", digits: 9, format: "XX XXX XXXX" },
  { name: "Kenya", code: "+254", flag: "🇰🇪", digits: 9, format: "XXX XXXXXX" },
  { name: "South Africa", code: "+27", flag: "🇿🇦", digits: 9, format: "XX XXX XXXX" },
  { name: "United States", code: "+1", flag: "🇺🇸", digits: 10, format: "XXX XXX XXXX" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧", digits: 10, format: "XX XXXX XXXX" },
  { name: "Canada", code: "+1", flag: "🇨🇦", digits: 10, format: "XXX XXX XXXX" },
  ];

interface PhoneInputProps {
  formData: {
    countryCode: string;
    phone: string;
  };
  onChange: (field: string, value: string) => void;
  onCountryChange: (country: typeof countries[0]) => void;
  error?: string;
}

function ImprovedPhoneInput({ formData, onChange, onCountryChange, error }: PhoneInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCountry = countries.find(c => c.code === formData.countryCode) || countries[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountrySelect = (country: typeof countries[0]) => {
    onCountryChange(country);
    onChange('phone', '');
    setIsDropdownOpen(false);
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (!value.startsWith('+') && value.length > 0 && /^\d/.test(value)) {
      value = '+' + value;
    }
    if (value === '+' || value === '') {
      onChange('countryCode', value);
    } else {
      value = '+' + value.slice(1).replace(/\D/g, '');
      onChange('countryCode', value);
    }

    const matchingCountry = countries.find(c => c.code === value);
    if (matchingCountry) {
      onCountryChange(matchingCountry);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length <= currentCountry.digits) {
      onChange('phone', rawValue);
    }
  };

  const formatPhoneNumberForDisplay = (number: string) => {
    if (!number || !currentCountry.format) return number;

    let formatted = '';
    let numberIndex = 0;

    for (let i = 0; i < currentCountry.format.length; i++) {
      const char = currentCountry.format[i];
      if (char === 'X') {
        if (numberIndex < number.length) {
          formatted += number[numberIndex];
          numberIndex++;
        } else {
          break;
        }
      } else {
        if (numberIndex < number.length || formatted.length > 0) {
          formatted += char;
        }
      }
    }
    return formatted.trim();
  };

  const isPhoneValid = formData.phone.length === currentCountry.digits;
  const phoneDisplayValue = formatPhoneNumberForDisplay(formData.phone);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Phone Number
      </label>

      <div
        className={`flex rounded-xl shadow-sm border bg-white transition-all duration-200 ${
          error
            ? "border-red-300 focus-within:ring-2 focus-within:ring-red-500"
            : "border-gray-200 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500"
        }`}
      >
        {/* Flag & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center h-full px-2 py-2 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50 rounded-l-xl"
          >
            <span className="text-lg mr-2">{currentCountry.flag}</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
              {countries.map((country) => (
                <button
                  key={country.name}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 text-left transition-colors ${
                    country.code === currentCountry.code ? "bg-green-50" : ""
                  }`}
                >
                  <span className="text-lg mr-3">{country.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{country.name}</div>
                    <div className="text-xs text-gray-500">{country.code}</div>
                  </div>
                  {country.code === currentCountry.code && (
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Country Code Input */}
        <input
          type="text"
          value={formData.countryCode}
          onChange={handleCountryCodeChange}
          className="w-20 px-2 py-2 border-r border-gray-200 bg-transparent focus:outline-none text-center text-sm font-medium"
          placeholder="+234"
          maxLength={5}
        />

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneDisplayValue}
          onChange={handlePhoneChange}
          className="flex-1 px-4 py-3 bg-transparent focus:outline-none rounded-r-xl"
          placeholder={`e.g., ${currentCountry.format?.replace(/X/g, "0") || "123 456 7890"}`}
          maxLength={
            currentCountry.digits + (currentCountry.format?.match(/[^X]/g)?.length || 0)
          }
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-gray-500">
          Expected: {currentCountry.digits} digits for {currentCountry.name}
        </p>
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs ${isPhoneValid ? "text-green-600" : "text-gray-400"}`}
          >
            {formData.phone.length}/{currentCountry.digits}
          </span>
          {isPhoneValid && (
            <svg
              className="w-4 h-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

// ------------------- Signup Component -------------------

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
}

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+234",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailExists, setEmailExists] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (error) setError("");
    if (name === "email" && emailExists) setEmailExists(false);
  };

  const handlePhoneChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (country: typeof countries[0]) => {
    setFormData((prev) => ({ ...prev, countryCode: country.code }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return "First name is required";
    if (!formData.lastName.trim()) return "Last name is required";
    if (!formData.email.trim()) return "Email is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Please enter a valid email";

    const currentCountry = countries.find((c) => c.code === formData.countryCode);
    if (!currentCountry) return "Please select a valid country";

    if (formData.phone.length !== currentCountry.digits) {
      return `Please enter a valid ${currentCountry.name} phone number`;
    }

    return null;
  };

  const formatPhoneNumber = () => `${formData.countryCode}${formData.phone}`;

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
      // Check if email exists
      const emailCheckResponse = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.toLowerCase() }),
      });

      const emailCheckData = await emailCheckResponse.json();

      if (!emailCheckResponse.ok) {
        setError("Unable to verify email. Please try again.");
        return;
      }

      if (emailCheckData.exists) {
        setError("An account with this email already exists.");
        setEmailExists(true);
        return;
      }

      // Send OTP
      const formattedPhone = formatPhoneNumber();
      const name = `${formData.firstName} ${formData.lastName}`.trim();

      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.toLowerCase(),
          phone: formattedPhone,
          name: name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem(
          "signupData",
          JSON.stringify({
            ...formData,
            phone: formattedPhone,
            name: name,
          })
        );

        sessionStorage.setItem(
          "otpData",
          JSON.stringify({
            otp: data.otp,
            generatedAt: data.generatedAt,
            email: formData.email.toLowerCase(),
            phone: data.phone,
          })
        );

        router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}&type=signup`);
      } else {
        setError(data.error || "Failed to send verification code");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      setEmailExists(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" flex flex-col">
      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-3 pb-8">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 sm:p-8">
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

              {/* Name Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
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

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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

              {/* Phone Input */}
              <ImprovedPhoneInput
                formData={{
                  countryCode: formData.countryCode,
                  phone: formData.phone,
                }}
                onChange={handlePhoneChange}
                onCountryChange={handleCountryChange}
                error={error?.toLowerCase().includes("phone") ? error : undefined}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#05F04B] text-black py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
              <span className="text-gray-500 text-sm">Already have an account? </span>
              <Link href="/auth/login" className="text-green-600 text-sm font-semibold hover:text-green-700 transition-colors">
                Sign in
              </Link>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link href="/auth/welcome" className="text-gray-500 text-sm hover:text-gray-700 inline-flex items-center transition-colors">
              ← Back to welcome
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
