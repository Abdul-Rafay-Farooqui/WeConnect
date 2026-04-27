"use client";

import { useEffect, useMemo, useState } from "react";
import { getSocket } from "@/lib/socket";
import MeetingRoomModal from "./MeetingRoomModal";
import { useUIStore } from "@/store/uiStore";
import { MeetingScheduler } from "@/lib/meetingScheduler";
import { Video, Phone, Calendar, Clock, Users, Plus, Play, X, Bell } from "lucide-react";

const MeetingsTab = ({
  meetings = [] as any[],
  members = [] as any[],
  organizationId,
  teamId,
  currentUserId,
  isAdmin,
  onScheduleMeeting,
  onStartMeetingNow,
  onStartMeeting,
  onEndMeeting,
  onRefresh,
}: any) => {
  const [isBusy, setIsBusy] = useState(false);
  const [meetingToJoin, setMeetingToJoin] = useState<any>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const openMeetingScreen = useUIStore((s) => s.openMeetingScreen);
  const addMeetingNotification = useUIStore((s) => s.addMeetingNotification);

  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    call_type: "video",
  });

  const sortedMeetings = useMemo(() => {
    return [...meetings].sort((a, b) => {
      const at = a?.starts_at ? new Date(a.starts_at).getTime() : 0;
      const bt = b?.starts_at ? new Date(b.starts_at).getTime() : 0;
      return bt - at;
    });
  }, [meetings]);

  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    return sortedMeetings.filter((m) => {
      if (m.status === "ongoing") return true;
      if (m.status === "scheduled" && m.starts_at) {
        return new Date(m.starts_at) > now;
      }
      return false;
    });
  }, [sortedMeetings]);

  const pastMeetings = useMemo(() => {
    const now = new Date();
    return sortedMeetings.filter((m) => {
      if (m.status === "ended") return true;
      if (m.status === "scheduled" && m.starts_at) {
        return new Date(m.starts_at) <= now;
      }
      return false;
    });
  }, [sortedMeetings]);

  // Initialize meeting scheduler and notifications
  useEffect(() => {
    if (!organizationId || !teamId || !onRefresh) return;
    
    // Start monitoring scheduled meetings
    MeetingScheduler.startMonitoring(meetings);
    
    // Request notification permission
    MeetingScheduler.requestNotificationPermission().then((granted) => {
      setNotificationsEnabled(granted);
    });

    const socket = getSocket();
    const refetch = () => {
      onRefresh();
    };

    socket.on("meeting:scheduled", (data: any) => {
      refetch();
      if (data?.meeting) {
        MeetingScheduler.notifyMeetingScheduled(data.meeting);
      }
    });
    
    socket.on("meeting:started", (data: any) => {
      refetch();
      if (data?.meeting) {
        MeetingScheduler.notifyMeetingStarted(data.meeting);
        addMeetingNotification({
          id: `${data.meeting.id}-started-${Date.now()}`,
          meeting_id: data.meeting.id,
          organization_id: data.meeting.organization_id,
          team_id: data.meeting.team_id,
          title: data.meeting.title,
          type: 'started',
          message: 'Meeting has started. Join now!',
          call_type: data.meeting.call_type,
          created_at: new Date().toISOString(),
          read: false,
        });
      }
    });
    
    socket.on("meeting:ended", refetch);

    return () => {
      socket.off("meeting:scheduled");
      socket.off("meeting:started");
      socket.off("meeting:ended");
      MeetingScheduler.stopMonitoring();
    };
  }, [organizationId, teamId, onRefresh, meetings, addMeetingNotification]);

  const submitSchedule = async () => {
    if (!onScheduleMeeting) return;
    if (
      !scheduleForm.title ||
      !scheduleForm.date ||
      !scheduleForm.startTime ||
      !scheduleForm.endTime
    ) {
      alert("Please provide title, date, start time, and end time.");
      return;
    }

    const startsAt = new Date(`${scheduleForm.date}T${scheduleForm.startTime}`);
    const endsAt = new Date(`${scheduleForm.date}T${scheduleForm.endTime}`);
    if (endsAt <= startsAt) {
      alert("End time must be after start time.");
      return;
    }

    try {
      setIsBusy(true);
      await onScheduleMeeting({
        title: scheduleForm.title,
        description: scheduleForm.description || undefined,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        call_type: scheduleForm.call_type,
        attendee_ids: members.map((m: any) => m.id),
      });
      setScheduleForm({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        call_type: "video",
      });
      setShowScheduleModal(false);
    } finally {
      setIsBusy(false);
    }
  };

  const submitStartNow = async () => {
    if (!onStartMeetingNow) return;
    const instantTitle = "Instant Team Meeting";

    try {
      setIsBusy(true);
      const started = await onStartMeetingNow({
        title: instantTitle,
        duration_minutes: 60,
        call_type: "video",
        attendee_ids: members.map((m: any) => m.id),
      });

      if (started?.meeting_id && organizationId && teamId) {
        openMeetingScreen({
          organization_id: organizationId,
          team_id: teamId,
          meeting_id: started.meeting_id,
          title: instantTitle,
          call_type: started.call_type || "video",
        });
      } else {
        await onRefresh?.();
        const liveMeeting = (meetings || []).find(
          (m: any) => m.title === instantTitle && m.status === "ongoing",
        );
        if (liveMeeting) setMeetingToJoin(liveMeeting);
      }
    } finally {
      setIsBusy(false);
    }
  };

  const openMeeting = async (meeting: any) => {
    if (meeting.status !== "ongoing") return;
    if (organizationId && teamId) {
      openMeetingScreen({
        organization_id: organizationId,
        team_id: teamId,
        meeting_id: meeting.id,
        title: meeting.title,
        call_type: meeting.call_type || "video",
      });
      return;
    }
    setMeetingToJoin(meeting);
  };

  const startScheduledMeeting = async (meeting: any) => {
    if (!onStartMeeting) return;
    try {
      setIsBusy(true);
      const started = await onStartMeeting(
        meeting.id,
        meeting.call_type || "video",
      );
      if (organizationId && teamId) {
        openMeetingScreen({
          organization_id: organizationId,
          team_id: teamId,
          meeting_id: started?.meeting_id || meeting.id,
          title: meeting.title,
          call_type: started?.call_type || meeting.call_type || "video",
        });
      } else {
        await onRefresh?.();
        setMeetingToJoin({ ...meeting, status: "ongoing" });
      }
    } finally {
      setIsBusy(false);
    }
  };

  const endLiveMeeting = async (meetingId: string) => {
    if (!onEndMeeting) return;
    try {
      setIsBusy(true);
      await onEndMeeting(meetingId);
      await onRefresh?.();
      if (meetingToJoin?.id === meetingId) setMeetingToJoin(null);
    } finally {
      setIsBusy(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const date = new Date(time);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          disabled={isBusy || !isAdmin}
          onClick={submitStartNow}
          className="group relative overflow-hidden bg-gradient-to-br from-[#00a884] to-[#008069] hover:from-[#00ba95] hover:to-[#00a884] text-white rounded-xl p-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Video className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold">Start Instant Meeting</h3>
              <p className="text-sm text-white/80">Begin a meeting right now</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
        </button>

        <button
          disabled={!isAdmin}
          onClick={() => setShowScheduleModal(true)}
          className="group relative overflow-hidden bg-[#111b21] hover:bg-[#1a252c] border-2 border-[#2a3942] hover:border-[#00a884] text-[#e9edef] rounded-xl p-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#2a3942] group-hover:bg-[#00a884]/20 flex items-center justify-center transition-colors">
              <Calendar className="w-7 h-7 text-[#00a884]" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold">Schedule Meeting</h3>
              <p className="text-sm text-[#8696a0]">Plan for later</p>
            </div>
          </div>
        </button>
      </div>

      {/* Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[#e9edef] text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#00a884]" />
            Upcoming & Live Meetings
          </h3>
          <div className="space-y-3">
            {upcomingMeetings.map((meeting: any) => (
              <div
                key={meeting.id}
                className={`bg-[#111b21] border-2 rounded-xl p-4 transition-all ${
                  meeting.status === "ongoing"
                    ? "border-[#00a884] shadow-lg shadow-[#00a884]/20"
                    : "border-[#222d34] hover:border-[#2a3942]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {meeting.call_type === "video" ? (
                        <Video className="w-4 h-4 text-[#00a884] flex-shrink-0" />
                      ) : (
                        <Phone className="w-4 h-4 text-[#00a884] flex-shrink-0" />
                      )}
                      <h4 className="text-[#e9edef] font-semibold truncate">
                        {meeting.title}
                      </h4>
                      {meeting.status === "ongoing" && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1 flex-shrink-0">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#8696a0]">
                      {meeting.starts_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(meeting.starts_at)}
                        </span>
                      )}
                      {meeting.starts_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(meeting.starts_at)}
                          {meeting.ends_at && ` - ${formatTime(meeting.ends_at)}`}
                        </span>
                      )}
                      {meeting.attendees && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {meeting.attendees} participants
                        </span>
                      )}
                    </div>

                    {meeting.description && (
                      <p className="text-sm text-[#8696a0] mt-2 line-clamp-2">
                        {meeting.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {meeting.status === "ongoing" && (
                      <>
                        <button
                          onClick={() => openMeeting(meeting)}
                          className="px-4 py-2 rounded-lg bg-[#00a884] hover:bg-[#00ba95] text-white text-sm font-semibold transition-all flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Join
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => endLiveMeeting(meeting.id)}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all"
                          >
                            End
                          </button>
                        )}
                      </>
                    )}

                    {meeting.status === "scheduled" && isAdmin && (
                      <button
                        onClick={() => startScheduledMeeting(meeting)}
                        className="px-4 py-2 rounded-lg bg-[#2a3942] hover:bg-[#364751] text-[#e9edef] text-sm font-semibold transition-all flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Start
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[#8696a0] text-sm font-semibold uppercase tracking-wider">
            Past Meetings
          </h3>
          <div className="space-y-2">
            {pastMeetings.slice(0, 5).map((meeting: any) => (
              <div
                key={meeting.id}
                className="bg-[#111b21] border border-[#222d34] rounded-lg p-3 opacity-60"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {meeting.call_type === "video" ? (
                        <Video className="w-3.5 h-3.5 text-[#8696a0] flex-shrink-0" />
                      ) : (
                        <Phone className="w-3.5 h-3.5 text-[#8696a0] flex-shrink-0" />
                      )}
                      <p className="text-[#e9edef] text-sm font-medium truncate">
                        {meeting.title}
                      </p>
                    </div>
                    <p className="text-xs text-[#8696a0] mt-1">
                      {meeting.date} • {meeting.time}
                    </p>
                  </div>
                  <span className="text-xs text-[#8696a0] capitalize flex-shrink-0">
                    {meeting.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingMeetings.length === 0 && pastMeetings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-[#1a252c] flex items-center justify-center mb-4">
            <Video className="w-10 h-10 text-[#8696a0]" />
          </div>
          <p className="text-[#e9edef] font-medium mb-1">No meetings scheduled</p>
          <p className="text-[#8696a0] text-sm">
            Start an instant meeting or schedule one for later
          </p>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111b21] border border-[#222d34] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#111b21] border-b border-[#222d34] p-6 flex items-center justify-between">
              <h3 className="text-[#e9edef] text-xl font-semibold">Schedule Meeting</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-2 rounded-lg hover:bg-[#202c33] text-[#8696a0] hover:text-[#e9edef] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[#8696a0] text-sm font-medium mb-2">
                  Meeting Title *
                </label>
                <input
                  value={scheduleForm.title}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Weekly Team Sync"
                  className="w-full px-4 py-3 rounded-lg bg-[#0b141a] border border-[#2a3942] text-[#e9edef] placeholder-[#4a5568] focus:border-[#00a884] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#8696a0] text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={scheduleForm.description}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Add meeting agenda or notes..."
                  className="w-full px-4 py-3 rounded-lg bg-[#0b141a] border border-[#2a3942] text-[#e9edef] placeholder-[#4a5568] focus:border-[#00a884] focus:outline-none transition-colors h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8696a0] text-sm font-medium mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-lg bg-[#0b141a] border border-[#2a3942] text-[#e9edef] focus:border-[#00a884] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#8696a0] text-sm font-medium mb-2">
                    Call Type *
                  </label>
                  <select
                    value={scheduleForm.call_type}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        call_type: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-lg bg-[#0b141a] border border-[#2a3942] text-[#e9edef] focus:border-[#00a884] focus:outline-none transition-colors"
                  >
                    <option value="video">Video Call</option>
                    <option value="voice">Voice Call</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8696a0] text-sm font-medium mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-lg bg-[#0b141a] border border-[#2a3942] text-[#e9edef] focus:border-[#00a884] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#8696a0] text-sm font-medium mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.endTime}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-lg bg-[#0b141a] border border-[#2a3942] text-[#e9edef] focus:border-[#00a884] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="bg-[#0b141a] border border-[#2a3942] rounded-lg p-4">
                <div className="flex items-center gap-2 text-[#8696a0] text-sm">
                  <Users className="w-4 h-4" />
                  <span>All team members ({members.length}) will be invited</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={isBusy}
                  onClick={submitSchedule}
                  className="flex-1 px-4 py-3 rounded-lg bg-[#00a884] hover:bg-[#00ba95] text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isBusy ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Schedule Meeting
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MeetingRoomModal
        open={!!meetingToJoin}
        meeting={meetingToJoin}
        organizationId={organizationId}
        teamId={teamId}
        currentUserId={currentUserId}
        members={members}
        onClose={() => setMeetingToJoin(null)}
        onRefresh={onRefresh}
      />
      
      {/* Notification Permission Banner */}
      {!notificationsEnabled && upcomingMeetings.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[#e9edef] font-medium mb-1">Enable Meeting Notifications</p>
            <p className="text-[#8696a0] text-sm mb-3">
              Get notified before your scheduled meetings start
            </p>
            <button
              onClick={async () => {
                const granted = await MeetingScheduler.requestNotificationPermission();
                setNotificationsEnabled(granted);
              }}
              className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-[#0b141a] text-sm font-semibold transition-all"
            >
              Enable Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsTab;
