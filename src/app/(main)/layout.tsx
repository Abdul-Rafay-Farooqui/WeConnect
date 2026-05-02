"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/src/components/layout/Sidebar";
import AddContactModal from "@/src/components/contacts/AddContactModal";
import IncomingCallModal from "@/src/components/calls/IncomingCallModal";
import ForwardMessageModal from "@/src/components/chat/ForwardMessageModal";
import DeleteMessageModal from "@/src/components/chat/DeleteMessageModal";
import LockChatModal from "@/src/components/layout/LockChatModal";
import MeetingStartBanner from "@/src/components/layout/MeetingStartBanner";
import JitsiMeetingRoom from "@/src/components/organization/tabs/JitsiMeetingRoom";
import OrgView from "@/src/components/organization/OrgView";
import NotificationCenter from "@/src/components/organization/NotificationCenter";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { useRouter } from "next/navigation";
import { MessageCircle, Building2, Bell } from "lucide-react";
import dynamic from "next/dynamic";
import { OrganizationAPI } from "@/lib/api/organization";
import { getSocket } from "@/lib/socket";

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
  
  // All state hooks must be called unconditionally
  const [mainTab, setMainTab] = useState<"chat" | "organization">("chat");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [bellAnimation, setBellAnimation] = useState(false);

  // All effect hooks must be called unconditionally
  useEffect(() => {
    if (!isAuthLoaded) return;
    if (!user) {
      router.push("/auth/login");
    } else if (profile && !profile.onboarding_complete) {
      router.push("/auth/onboarding");
    }
  }, [user, profile, isAuthLoaded, router]);

  // Load notifications when organization is selected
  useEffect(() => {
    if (selectedOrgId && mainTab === "organization") {
      loadNotifications();
    }
  }, [selectedOrgId, mainTab]);

  // WebSocket listener for real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();
    
    const handleNewNotification = (data: any) => {
      console.log('[Layout] Received new notification via WebSocket:', data);
      
      // Animate bell
      setBellAnimation(true);
      setTimeout(() => setBellAnimation(false), 1000);
      
      // Reload notifications to get the full data
      if (selectedOrgId) {
        loadNotifications();
      }
    };

    // Listen for notification events
    socket.on('notification:new', handleNewNotification);

    // Cleanup
    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [user?.id, selectedOrgId]);

  const loadNotifications = async () => {
    if (!selectedOrgId) return;
    try {
      console.log('[Layout] Loading notifications for org:', selectedOrgId);
      const data = await OrganizationAPI.getNotifications(selectedOrgId);
      console.log('[Layout] Received notification data:', data);
      setNotifications(data?.notifications || []);
      setUnreadCount(data?.unread_count || 0);
    } catch (err) {
      console.error('[Layout] Failed to load notifications:', err);
    }
  };

  // Conditional rendering after all hooks
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
        <div className="flex items-center justify-between bg-[#111b21] border-b border-[#222d34] px-4 flex-shrink-0">
          <div className="flex items-center gap-1">
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

          {/* Notification Bell - Always show on organization tab */}
          {mainTab === "organization" && (
            <button
              onClick={() => {
                if (selectedOrgId) {
                  setShowNotifications(!showNotifications);
                }
              }}
              disabled={!selectedOrgId}
              className={`relative p-2 rounded-lg transition-all ${
                selectedOrgId
                  ? 'text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33] cursor-pointer'
                  : 'text-[#8696a0]/40 cursor-not-allowed'
              } ${bellAnimation ? 'animate-bounce' : ''}`}
              title={selectedOrgId ? "Notifications" : "Select an organization to view notifications"}
            >
              <Bell className={`w-5 h-5 ${bellAnimation ? 'text-[#00a884]' : ''}`} />
              {selectedOrgId && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold bg-[#00a884] text-[#0b141a] rounded-full animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {mainTab === "chat" && (
            <main className="h-full w-full">{children}</main>
          )}
          {mainTab === "organization" && (
            <div className="h-full w-full">
              <OrgView onOrgChange={setSelectedOrgId} />
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

      {/* Notification Center Modal */}
      {showNotifications && selectedOrgId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#0b141a] rounded-xl w-full max-w-2xl h-[600px] shadow-2xl border border-[#222d34] overflow-hidden">
            <NotificationCenter
              organizationId={selectedOrgId}
              currentUserId={user?.id}
              onClose={() => {
                setShowNotifications(false);
                // Refresh notifications to update unread count
                loadNotifications();
              }}
              onNotificationRead={() => {
                // Update unread count when notification is marked as read
                loadNotifications();
              }}
            />
          </div>
        </div>
      )}

      <MeetingStartBanner
        onOpenMeeting={(payload) => {
          openMeetingScreen(payload);
        }}
      />

      {activeMeetingScreen && user?.id && (
        <JitsiMeetingRoom
          open={!!activeMeetingScreen}
          meeting={{
            id: activeMeetingScreen.meeting_id,
            title: activeMeetingScreen.title || "Meeting",
            call_type: activeMeetingScreen.call_type || "video",
          }}
          organizationId={activeMeetingScreen.organization_id}
          teamId={activeMeetingScreen.team_id}
          currentUserId={user.id}
          currentUserName={profile?.display_name || user?.email || "User"}
          onClose={closeMeetingScreen}
          onEndMeeting={async (meetingId: string) => {
            try {
              await OrganizationAPI.endMeeting(
                activeMeetingScreen.organization_id,
                activeMeetingScreen.team_id,
                meetingId
              );
            } catch (error) {
              console.error('[Meeting] Failed to end meeting:', error);
            }
          }}
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
