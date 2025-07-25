import Image from "next/image";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = "Loading NEXT...",
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/assets/logo-name.png"
            alt="NEXT"
            width={200}
            height={80}
            className="h-16 w-auto object-contain"
            priority
          />
        </div>

        {/* Custom CSS Loader */}
        <div className="flex justify-center mb-6">
          <div className="loader"></div>
        </div>

        {/* Loading message */}
        <p className="text-gray-600 text-lg font-medium mb-2">{message}</p>
        <p className="text-gray-500 text-sm">Africa's first secure super-app</p>
      </div>

      <style jsx>{`
        .loader {
          width: 4px;
          color: var(--color-primary, #00f45e);
          aspect-ratio: 1;
          border-radius: 50%;
          box-shadow: 19px -19px 0 0px, 38px -19px 0 0px, 57px -19px 0 0px,
            19px 0 0 5px, 38px 0 0 5px, 57px 0 0 5px, 19px 19px 0 0px,
            38px 19px 0 0px, 57px 19px 0 0px;
          transform: translateX(-38px);
          animation: l26 2s infinite linear;
        }

        @keyframes l26 {
          12.5% {
            box-shadow: 19px -19px 0 0px, 38px -19px 0 0px, 57px -19px 0 5px,
              19px 0 0 5px, 38px 0 0 0px, 57px 0 0 5px, 19px 19px 0 0px,
              38px 19px 0 0px, 57px 19px 0 0px;
          }
          25% {
            box-shadow: 19px -19px 0 5px, 38px -19px 0 0px, 57px -19px 0 5px,
              19px 0 0 0px, 38px 0 0 0px, 57px 0 0 0px, 19px 19px 0 0px,
              38px 19px 0 5px, 57px 19px 0 0px;
          }
          50% {
            box-shadow: 19px -19px 0 5px, 38px -19px 0 5px, 57px -19px 0 0px,
              19px 0 0 0px, 38px 0 0 0px, 57px 0 0 0px, 19px 19px 0 0px,
              38px 19px 0 0px, 57px 19px 0 5px;
          }
          62.5% {
            box-shadow: 19px -19px 0 0px, 38px -19px 0 0px, 57px -19px 0 0px,
              19px 0 0 5px, 38px 0 0 0px, 57px 0 0 0px, 19px 19px 0 0px,
              38px 19px 0 5px, 57px 19px 0 5px;
          }
          75% {
            box-shadow: 19px -19px 0 0px, 38px -19px 0 5px, 57px -19px 0 0px,
              19px 0 0 0px, 38px 0 0 0px, 57px 0 0 5px, 19px 19px 0 0px,
              38px 19px 0 0px, 57px 19px 0 5px;
          }
          87.5% {
            box-shadow: 19px -19px 0 0px, 38px -19px 0 5px, 57px -19px 0 0px,
              19px 0 0 0px, 38px 0 0 5px, 57px 0 0 0px, 19px 19px 0 5px,
              38px 19px 0 0px, 57px 19px 0 0px;
          }
        }
      `}</style>
    </div>
  );
}
