"use client";
import dynamic from "next/dynamic";

// Dynamically import CometChat component with SSR disabled
const CometChatComponent = dynamic(() => import("./CometChatNoSSR"), {
  ssr: false,
});

export default function CometChatAppWrapper() {
  return (
    <div>
      <CometChatComponent />
    </div>
  );
}
