"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/src/components/layout/Sidebar";
import AddContactModal from "@/src/components/contacts/AddContactModal";
import IncomingCallModal from "@/src/components/calls/IncomingCallModal";
import ForwardMessageModal from "@/src/components/chat/ForwardMessageModal";
import DeleteMessageModal from "@/src/components/chat/DeleteMessageModal";
import LockChatModal from "@/src/components/layout/LockChatModal";
import MeetingStartBanner from "@/src/components/layout/MeetingStartBanner";
import MeetingRoomModal from "@/src/components/organization/tabs/MeetingRoomModal";
import OrgView from "@/src/components/organization/OrgView";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MessageCircle, Building2 } from "lucide-react";
import dynamic from "next/dynamic";

const CallModal = dynamic(() => import("@/src/components/calls/CallModal"), {
  ssr: false,
});

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, isAuthLoaded } = useAuthStore();
  const activeMeetingScreen = useUIStore((s) => s.activeMeetingScreen);
  const openMeetingScreen = useUIStore((s) => s.openMeetingScreen);
  const closeMeetingScreen = useUIStore((s) => s.closeMeetingScreen);
  const router = useRouter();
  const pathname = usePathname();
  const [mainTab, setMainTab] = useState<"chat" | "organization">("chat");

  useEffect(() => {
    if (!isAuthLoaded) return;
    if (!user) {
      router.push("/auth/login");
    } else if (profile && !profile.onboarding_complete) {
      router.push("/auth/onboarding");
    }
  }, [user, profile, isAuthLoaded, router]);

  if (!isAuthLoaded) {
    return (
      <div className="h-screen w-screen bg-[#111b21] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#8696a0] text-sm">Loading ChatWave...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (profile && !profile.onboarding_complete) return null;

  // Pages that bypass the tab layout (auth, ai-chat, etc.)
  const isAiChat = pathname === "/ai-chat";

  return (
    <div className="h-screen w-screen flex bg-[#0b141a] overflow-hidden">
      {/* Left sidebar — only shown on chat tab */}
      {mainTab === "chat" && (
        <div className="w-[355px] flex-shrink-0 border-r border-[#222d34]">
          <Sidebar />
        </div>
      )}

      {/* Right area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center bg-[#111b21] border-b border-[#222d34] px-4 gap-1 flex-shrink-0">
          <TabBtn
            icon={<MessageCircle className="w-4 h-4" />}
            label="Chat"
            active={mainTab === "chat"}
            onClick={() => setMainTab("chat")}
          />
          <TabBtn
            icon={<Building2 className="w-4 h-4" />}
            label="Organization"
            active={mainTab === "organization"}
            onClick={() => setMainTab("organization")}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {mainTab === "chat" && (
            <main className="h-full w-full">{children}</main>
          )}
          {mainTab === "organization" && (
            <div className="h-full w-full">
              <OrgView />
            </div>
          )}
        </div>
      </div>

      <AddContactModal />
      <CallModal />
      <IncomingCallModal />
      <ForwardMessageModal />
      <DeleteMessageModal />
      <LockChatModal />
      <MeetingStartBanner
        onOpenMeeting={(payload) => {
          openMeetingScreen(payload);
        }}
      />

      {activeMeetingScreen && user?.id && (
        <MeetingRoomModal
          open={!!activeMeetingScreen}
          meeting={{
            id: activeMeetingScreen.meeting_id,
            title: activeMeetingScreen.title || "Meeting",
            call_type: activeMeetingScreen.call_type || "video",
          }}
          organizationId={activeMeetingScreen.organization_id}
          teamId={activeMeetingScreen.team_id}
          currentUserId={user.id}
          members={[]}
          onClose={closeMeetingScreen}
        />
      )}
    </div>
  );
}

function TabBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
        active
          ? "text-[#00a884] border-[#00a884]"
          : "text-[#8696a0] border-transparent hover:text-[#e9edef]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
