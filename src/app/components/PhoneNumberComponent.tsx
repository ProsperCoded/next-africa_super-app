import { useState, useRef, useEffect } from "react"; // Import useRef and useEffect

// Enhanced country data with proper validation
export const countries = [
  { name: "Nigeria", code: "+234", flag: "🇳🇬", digits: 10, format: "XXX XXX XXXX" },
  { name: "Ghana", code: "+233", flag: "🇬🇭", digits: 9, format: "XX XXX XXXX" },
  { name: "Kenya", code: "+254", flag: "🇰🇪", digits: 9, format: "XXX XXXXXX" },
  { name: "South Africa", code: "+27", flag: "🇿🇦", digits: 9, format: "XX XXX XXXX" },
  { name: "United States", code: "+1", flag: "🇺🇸", digits: 10, format: "XXX XXX XXXX" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧", digits: 10, format: "XX XXXX XXXX" },
  { name: "Canada", code: "+1", flag: "🇨🇦", digits: 10, format: "XXX XXX XXXX" },
  { name: "India", code: "+91", flag: "🇮🇳", digits: 10, format: "XXXXX XXXXX" },
  { name: "France", code: "+33", flag: "🇫🇷", digits: 9, format: "X XX XX XX XX" },
  { name: "Germany", code: "+49", flag: "🇩🇪", digits: 11, format: "XXX XXXXXXXX" },
];

interface PhoneInputProps {
  formData: {
    countryCode: string;
    phone: string;
  };
  onChange: (field: string, value: string) => void;
  onCountryChange: (country: typeof countries[0]) => void; // Explicitly type country object
  error?: string;
}

export default function PhoneNumberComponent({ formData, onChange, onCountryChange, error }: PhoneInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for closing dropdown on outside click

  // Find current country based on country code
  const currentCountry = countries.find(c => c.code === formData.countryCode) || countries[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle country selection from dropdown
  const handleCountrySelect = (country: typeof countries[0]) => {
    onCountryChange(country);
    onChange('phone', ''); // Clear phone number when country changes to avoid old number validation issues
    setIsDropdownOpen(false);
  };

  // Handle manual country code input
  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Ensure it starts with + if the user types a digit first
    if (!value.startsWith('+') && value.length > 0 && /^\d/.test(value)) {
      value = '+' + value;
    }
    // Allow empty or just '+' for temporary states
    if (value === '+' || value === '') {
        onChange('countryCode', value);
    } else {
        // Only allow digits after '+'
        value = '+' + value.slice(1).replace(/\D/g, '');
        onChange('countryCode', value);
    }
    
    // Try to find matching country and update
    const matchingCountry = countries.find(c => c.code === value);
    if (matchingCountry) {
      onCountryChange(matchingCountry);
      // You might also want to clear the phone number if country changes via manual code
      // onChange('phone', ''); 
    }
  };

  // Handle phone number input with length validation and automatic formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Only digits from input

    // Only allow typing up to the max digits for the current country
    if (rawValue.length <= currentCountry.digits) {
      onChange('phone', rawValue);
    }
  };

  // Format phone number for display based on current country's format
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
          // Stop formatting if we run out of digits
          break;
        }
      } else {
        // Add non-X characters (spaces, dashes, etc.) from the format string
        // but only if there are still digits to follow or we're explicitly at that point in the format
        if (numberIndex < number.length || formatted.length > 0) { // Add separator if digits exist or already started formatting
            formatted += char;
        }
      }
    }
    return formatted.trim(); // Trim trailing spaces if any
  };

  // Validate phone number length
  const isPhoneValid = formData.phone.length === currentCountry.digits;
  const phoneDisplayValue = formatPhoneNumberForDisplay(formData.phone);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Phone Number
      </label>

      <div className={`flex rounded-xl shadow-sm border bg-white transition-all duration-200 ${
        error ? 'border-red-300 focus-within:ring-2 focus-within:ring-red-500' :
        'border-gray-200 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500'
      }`}>

        {/* Country Flag Dropdown Button */}
        <div className="relative" ref={dropdownRef}> {/* Attach ref here */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center h-full px-3 py-3 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50 rounded-l-xl" // Rounded left
          >
            <span className="text-lg mr-2">{currentCountry.flag}</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Backdrop - removed fixed inset-0 to prevent scroll issues, relying on dropdownRef */}
              {/* <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} /> */}

              {/* Dropdown Content */}
              <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 text-left transition-colors ${
                      country.code === currentCountry.code ? 'bg-green-50' : ''
                    }`}
                  >
                    <span className="text-lg mr-3">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {country.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {country.code}
                      </div>
                    </div>
                    {country.code === currentCountry.code && (
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Country Code Input (Demarcation 1 is the border-r from flag div) */}
        <input
          type="text"
          value={formData.countryCode}
          onChange={handleCountryCodeChange}
          className="w-20 px-3 py-3 border-r border-gray-200 bg-transparent focus:outline-none text-center text-sm font-medium"
          placeholder="+234"
          maxLength={5} // e.g., +1, +234, +44. Adjust if needed.
        />

        {/* Phone Number Input (Demarcation 2 is the border-r from country code input) */}
        <input
          type="tel"
          value={phoneDisplayValue}
          onChange={handlePhoneChange}
          className="flex-1 px-4 py-3 bg-transparent focus:outline-none rounded-r-xl" // Rounded right
          placeholder={`e.g., ${currentCountry.format?.replace(/X/g, '0') || '123 456 7890'}`} // Dynamic placeholder
          maxLength={currentCountry.digits + (currentCountry.format?.match(/[^X]/g)?.length || 0)} // Max length for display
        />
      </div>

      {/* Helper Information */}
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-gray-500">
          Expected: {currentCountry.digits} digits for {currentCountry.name}
        </p>
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${
            isPhoneValid ? 'text-green-600' : 'text-gray-400'
          }`}>
            {formData.phone.length}/{currentCountry.digits}
          </span>
          {isPhoneValid && (
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}

      {/* Preview */}
      {formData.phone && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Full number: <span className="font-mono font-medium">{formData.countryCode} {phoneDisplayValue}</span>
          </p>
        </div>
      )}
    </div>
  );
}