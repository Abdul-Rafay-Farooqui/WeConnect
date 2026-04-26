'use client';

import Sidebar from '@/components/layout/Sidebar';
import AddContactModal from '@/components/contacts/AddContactModal';
import IncomingCallModal from '@/components/calls/IncomingCallModal';
import ForwardMessageModal from '@/components/chat/ForwardMessageModal';
import DeleteMessageModal from '@/components/chat/DeleteMessageModal';
import LockChatModal from '@/components/layout/LockChatModal';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Agora SDK uses `window` at import time — must be client-only, no SSR
const CallModal = dynamic(() => import('@/components/calls/CallModal'), { ssr: false });

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isAuthLoaded } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoaded) return; // Still initializing — don't redirect yet
    if (!user) {
      router.push('/auth/login');
    } else if (profile && !profile.onboarding_complete) {
      router.push('/auth/onboarding');
    }
  }, [user, profile, isAuthLoaded, router]);

  // Show spinner only during initial auth load, not during transitions
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

  if (!user) {
    return null; // Will redirect to login
  }

  if (profile && !profile.onboarding_complete) {
    return null; // Will redirect to onboarding
  }

  return (
    <div className="h-screen w-screen flex bg-[#0b141a] overflow-hidden">
      <div className="w-[355px] flex-shrink-0 border-r border-[#222d34]">
        <Sidebar />
      </div>
      <main className="flex-1 relative overflow-hidden">
        {children}
      </main>
      <AddContactModal />
      <CallModal />
      <IncomingCallModal />
      <ForwardMessageModal />
      <DeleteMessageModal />
      <LockChatModal />
    </div>
  );
}
