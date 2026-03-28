// ============================================
// EXTENDED SUPABASE API LAYER
// Complete API for all organization features
// ============================================

import { supabase } from "./supabase";

// ============= HELPER FUNCTIONS =============

async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function getUserData(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

// ============= ORGANIZATIONS =============

export async function createOrganization(
  name,
  icon,
  description = "",
  imageUrl = "",
) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("organizations")
    .insert([
      { name, icon, description, image_url: imageUrl, created_by: user.id },
    ])
    .select()
    .single();

  if (error) throw error;

  // Add creator as owner
  await supabase
    .from("organization_members")
    .insert([{ organization_id: data.id, user_id: user.id, role: "owner" }]);

  return data;
}

export async function getUserOrganizations() {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(*)")
    .eq("user_id", user.id);

  if (error) throw error;
  return data?.map((item) => item.organizations) || [];
}

export async function getOrgMembers(orgId) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("*, users:user_id(id, username, full_name, avatar_url)")
    .eq("organization_id", orgId);

  if (error) throw error;
  return data;
}

export async function addOrgMember(orgId, userId, role = "member") {
  const { data, error } = await supabase
    .from("organization_members")
    .insert([{ organization_id: orgId, user_id: userId, role }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeOrgMember(orgId, userId) {
  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("organization_id", orgId)
    .eq("user_id", userId);

  if (error) throw error;
}

// ============= DEPARTMENTS =============

export async function createDepartment(
  orgId,
  name,
  description = "",
  icon = "",
) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("departments")
    .insert([
      { organization_id: orgId, name, description, icon, created_by: user.id },
    ])
    .select()
    .single();

  if (error) throw error;

  // Add creator as admin
  await supabase
    .from("department_members")
    .insert([{ department_id: data.id, user_id: user.id, role: "admin" }]);

  return data;
}

export async function getDepartments(orgId) {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getDeptMembers(deptId) {
  const { data, error } = await supabase
    .from("department_members")
    .select("*, users:user_id(id, username, full_name, avatar_url, status)")
    .eq("department_id", deptId);

  if (error) throw error;
  return data;
}

export async function addDeptMember(deptId, userId, role = "member") {
  const { data, error } = await supabase
    .from("department_members")
    .insert([{ department_id: deptId, user_id: userId, role }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============= MESSAGES & CHAT =============

export async function sendMessage(deptId, content, mentions = []) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        department_id: deptId,
        sender_id: user.id,
        content,
        mentions: mentions,
      },
    ])
    .select("*, users:sender_id(id, username, full_name, avatar_url)")
    .single();

  if (error) throw error;
  return data;
}

export async function getMessages(deptId, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from("messages")
    .select("*, users:sender_id(id, username, full_name, avatar_url)")
    .eq("department_id", deptId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data?.reverse() || [];
}

export async function editMessage(messageId, newContent) {
  const { data, error } = await supabase
    .from("messages")
    .update({ content: newContent, edited_at: new Date() })
    .eq("id", messageId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMessage(messageId) {
  const { data, error } = await supabase
    .from("messages")
    .update({ deleted_at: new Date() })
    .eq("id", messageId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addMessageReaction(messageId, emoji) {
  const user = await getCurrentUser();
  try {
    const { data, error } = await supabase
      .from("message_reactions")
      .insert([{ message_id: messageId, user_id: user.id, emoji }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    if (error.code === "23505") {
      // Unique constraint, remove reaction instead
      await removeMessageReaction(messageId, emoji);
      return null;
    }
    throw error;
  }
}

export async function removeMessageReaction(messageId, emoji) {
  const user = await getCurrentUser();
  const { error } = await supabase
    .from("message_reactions")
    .delete()
    .eq("message_id", messageId)
    .eq("user_id", user.id)
    .eq("emoji", emoji);

  if (error) throw error;
}

export async function getMessageReactions(messageId) {
  const { data, error } = await supabase
    .from("message_reactions")
    .select("emoji, count(*) as count", { count: "exact" })
    .eq("message_id", messageId)
    .group_by("emoji");

  if (error) throw error;
  return data;
}

// ============= FILES & ATTACHMENTS =============

export async function uploadFile(deptId, file, messageId = null) {
  const user = await getCurrentUser();
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `departments/${deptId}/${fileName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("files")
    .upload(filePath, file, { cacheControl: "3600" });

  if (uploadError) throw uploadError;

  // Create file record
  const { data: fileData, error: dbError } = await supabase
    .from("files")
    .insert([
      {
        department_id: deptId,
        message_id: messageId,
        uploaded_by: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type.split("/")[0],
        mime_type: file.type,
      },
    ])
    .select()
    .single();

  if (dbError) throw dbError;
  return fileData;
}

export async function getFiles(deptId, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from("files")
    .select("*, users:uploaded_by(id, username, full_name, avatar_url)")
    .eq("department_id", deptId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

export async function deleteFile(fileId) {
  // Get file to delete
  const { data: fileData } = await supabase
    .from("files")
    .select("file_path")
    .eq("id", fileId)
    .single();

  if (fileData) {
    await supabase.storage.from("files").remove([fileData.file_path]);
  }

  const { error } = await supabase.from("files").delete().eq("id", fileId);
  if (error) throw error;
}

export async function getFileDownloadUrl(filePath) {
  const { data } = supabase.storage.from("files").getPublicUrl(filePath);
  return data;
}

// ============= MEETINGS & VIDEO CALLS =============

export async function createMeeting(
  deptId,
  title,
  description,
  startTime,
  endTime,
  options = {},
) {
  const user = await getCurrentUser();
  const webrtcRoomId = `${deptId}-${Date.now()}`;

  const { data, error } = await supabase
    .from("meetings")
    .insert([
      {
        department_id: deptId,
        creator_id: user.id,
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        webrtc_room_id: webrtcRoomId,
        status: "scheduled",
        recording_enabled: options.recordingEnabled || false,
        live_captions_enabled: options.liveCaptionsEnabled || false,
        allow_raise_hand: options.allowRaiseHand !== false,
        allow_screen_share: options.allowScreenShare !== false,
        allow_chat: options.allowChat !== false,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // Add creator as presenter
  await supabase
    .from("meeting_attendees")
    .insert([
      {
        meeting_id: data.id,
        user_id: user.id,
        status: "accepted",
        is_presenter: true,
      },
    ]);

  return data;
}

export async function getMeetings(deptId, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from("meetings")
    .select(
      `
      *,
      creator:creator_id(id, username, full_name, avatar_url),
      meeting_attendees(id, user_id, status)
    `,
    )
    .eq("department_id", deptId)
    .order("start_time", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

export async function getMeeting(meetingId) {
  const { data, error } = await supabase
    .from("meetings")
    .select(
      `
      *,
      creator:creator_id(id, username, full_name, avatar_url),
      meeting_attendees(
        *,
        users:user_id(id, username, full_name, avatar_url)
      )
    `,
    )
    .eq("id", meetingId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateMeeting(meetingId, updates) {
  const { data, error } = await supabase
    .from("meetings")
    .update(updates)
    .eq("id", meetingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function joinMeeting(meetingId) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("meeting_attendees")
    .upsert(
      [
        {
          meeting_id: meetingId,
          user_id: user.id,
          status: "accepted",
          joined_at: new Date(),
        },
      ],
      { onConflict: "meeting_id,user_id" },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function leaveMeeting(meetingId) {
  const user = await getCurrentUser();
  const { error } = await supabase
    .from("meeting_attendees")
    .update({ left_at: new Date() })
    .eq("meeting_id", meetingId)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function getMeetingAttendees(meetingId) {
  const { data, error } = await supabase
    .from("meeting_attendees")
    .select(
      `
      *,
      users:user_id(id, username, full_name, avatar_url, status)
    `,
    )
    .eq("meeting_id", meetingId)
    .order("joined_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateAttendeeStatus(meetingId, userId, status) {
  const { data, error } = await supabase
    .from("meeting_attendees")
    .update({ status })
    .eq("meeting_id", meetingId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function raiseHand(meetingId) {
  const user = await getCurrentUser();
  const { error } = await supabase
    .from("meeting_attendees")
    .update({ hand_raised: true, hand_raised_at: new Date() })
    .eq("meeting_id", meetingId)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function lowerHand(meetingId) {
  const user = await getCurrentUser();
  const { error } = await supabase
    .from("meeting_attendees")
    .update({ hand_raised: false })
    .eq("meeting_id", meetingId)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ============= TASKS =============

export async function createTask(
  deptId,
  title,
  description,
  assignedTo,
  dueDate,
  priority = "medium",
) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        department_id: deptId,
        title,
        description,
        assigned_to: assignedTo,
        created_by: user.id,
        due_date: dueDate,
        priority,
        status: "todo",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTasks(deptId, status = null) {
  let query = supabase
    .from("tasks")
    .select(
      `
      *,
      assigned_user:assigned_to(id, username, full_name, avatar_url),
      creator:created_by(id, username, full_name, avatar_url)
    `,
    )
    .eq("department_id", deptId);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("due_date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateTask(taskId, updates) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date() })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeTask(taskId) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ status: "completed", completed_at: new Date() })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(taskId) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
}

export async function addTaskComment(taskId, content) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("task_comments")
    .insert([{ task_id: taskId, user_id: user.id, content }])
    .select("*, users:user_id(id, username, full_name, avatar_url)")
    .single();

  if (error) throw error;
  return data;
}

export async function getTaskComments(taskId) {
  const { data, error } = await supabase
    .from("task_comments")
    .select("*, users:user_id(id, username, full_name, avatar_url)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

// ============= ATTENDANCE =============

export async function recordAttendance(
  deptId,
  userId,
  signInTime = null,
  status = "present",
) {
  const recordedDate = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("attendance_records")
    .upsert(
      [
        {
          department_id: deptId,
          user_id: userId,
          sign_in_time: signInTime || new Date(),
          status,
          recorded_date: recordedDate,
        },
      ],
      { onConflict: "department_id,user_id,recorded_date" },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function signOut(deptId, userId) {
  const recordedDate = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("attendance_records")
    .select("sign_in_time")
    .eq("department_id", deptId)
    .eq("user_id", userId)
    .eq("recorded_date", recordedDate)
    .single();

  let totalHours = 0;
  if (existing?.sign_in_time) {
    const signOut = new Date();
    const signIn = new Date(existing.sign_in_time);
    totalHours = (signOut - signIn) / (1000 * 60 * 60);
  }

  const { data, error } = await supabase
    .from("attendance_records")
    .update({
      sign_out_time: new Date(),
      status: "present",
      total_hours: totalHours,
    })
    .eq("department_id", deptId)
    .eq("user_id", userId)
    .eq("recorded_date", recordedDate)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAttendance(deptId, startDate = null, endDate = null) {
  let query = supabase
    .from("attendance_records")
    .select("*, users:user_id(id, username, full_name, avatar_url)")
    .eq("department_id", deptId);

  if (startDate) {
    query = query.gte("recorded_date", startDate);
  }
  if (endDate) {
    query = query.lte("recorded_date", endDate);
  }

  const { data, error } = await query.order("recorded_date", {
    ascending: false,
  });

  if (error) throw error;
  return data;
}

// ============= APPROVALS =============

export async function createApprovalRequest(
  deptId,
  requestType,
  title,
  description,
  options = {},
) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("approval_requests")
    .insert([
      {
        department_id: deptId,
        requester_id: user.id,
        request_type: requestType,
        title,
        description,
        amount: options.amount,
        start_date: options.startDate,
        end_date: options.endDate,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getApprovalRequests(deptId, status = null) {
  let query = supabase
    .from("approval_requests")
    .select(
      `
      *,
      requester:requester_id(id, username, full_name, avatar_url),
      approver:approver_id(id, username, full_name, avatar_url)
    `,
    )
    .eq("department_id", deptId);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function approveRequest(requestId, approverId, notes = "") {
  const { data, error } = await supabase
    .from("approval_requests")
    .update({
      status: "approved",
      approver_id: approverId,
      approval_note: notes,
      approved_at: new Date(),
    })
    .eq("id", requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function rejectRequest(requestId, approverId, notes = "") {
  const { data, error } = await supabase
    .from("approval_requests")
    .update({
      status: "rejected",
      approver_id: approverId,
      approval_note: notes,
      rejected_at: new Date(),
    })
    .eq("id", requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============= PRAISE & RECOGNITION =============

export async function sendPraise(deptId, toUserId, badge, message) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("praise")
    .insert([
      {
        department_id: deptId,
        from_user_id: user.id,
        to_user_id: toUserId,
        badge,
        message,
      },
    ])
    .select(
      "*, from_user:from_user_id(id, username, full_name, avatar_url), to_user:to_user_id(id, username, full_name, avatar_url)",
    )
    .single();

  if (error) throw error;
  return data;
}

export async function getPraise(deptId) {
  const { data, error } = await supabase
    .from("praise")
    .select(
      `
      *,
      from_user:from_user_id(id, username, full_name, avatar_url),
      to_user:to_user_id(id, username, full_name, avatar_url)
    `,
    )
    .eq("department_id", deptId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ============= SHIFTS & SCHEDULING =============

export async function createShift(
  deptId,
  userId,
  role,
  date,
  startTime,
  endTime,
) {
  const { data, error } = await supabase
    .from("shifts")
    .insert([
      {
        department_id: deptId,
        user_id: userId,
        role,
        shift_date: date,
        start_time: startTime,
        end_time: endTime,
        status: "scheduled",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getShifts(deptId, date = null) {
  let query = supabase
    .from("shifts")
    .select("*, users:user_id(id, username, full_name, avatar_url)")
    .eq("department_id", deptId);

  if (date) {
    query = query.eq("shift_date", date);
  }

  const { data, error } = await query.order("shift_date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateShiftStatus(shiftId, status) {
  const { data, error } = await supabase
    .from("shifts")
    .update({ status })
    .eq("id", shiftId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============= CALENDAR EVENTS =============

export async function createCalendarEvent(
  deptId,
  title,
  description,
  startDateTime,
  endDateTime,
  location = "",
) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("calendar_events")
    .insert([
      {
        department_id: deptId,
        creator_id: user.id,
        title,
        description,
        start_date_time: startDateTime,
        end_date_time: endDateTime,
        location,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCalendarEvents(
  deptId,
  startDate = null,
  endDate = null,
) {
  let query = supabase
    .from("calendar_events")
    .select("*, creator:creator_id(id, username, full_name, avatar_url)")
    .eq("department_id", deptId);

  if (startDate) {
    query = query.gte("start_date_time", startDate);
  }
  if (endDate) {
    query = query.lte("end_date_time", endDate);
  }

  const { data, error } = await query.order("start_date_time", {
    ascending: true,
  });

  if (error) throw error;
  return data;
}

// ============= USER PRESENCE & STATUS =============

export async function updateUserStatus(status) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("users")
    .update({ status, presence_updated_at: new Date() })
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOnlineUsers(deptId) {
  const { data, error } = await supabase
    .from("department_members")
    .select(
      "*, users:user_id(id, username, full_name, avatar_url, status, presence_updated_at)",
    )
    .eq("department_id", deptId)
    .neq("users.status", "offline");

  if (error) throw error;
  return data;
}

// ============= WHITEBOARD =============

export async function createWhiteboardSession(
  meetingId = null,
  deptId = null,
  title = "",
) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("whiteboard_sessions")
    .insert([
      {
        meeting_id: meetingId,
        department_id: deptId,
        creator_id: user.id,
        title,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWhiteboardCanvas(whiteboardId, canvasData) {
  const { data, error } = await supabase
    .from("whiteboard_sessions")
    .update({ canvas_data: canvasData, updated_at: new Date() })
    .eq("id", whiteboardId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addWhiteboardParticipant(whiteboardId, userId) {
  const { data, error } = await supabase
    .from("whiteboard_participants")
    .insert([{ whiteboard_session_id: whiteboardId, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============= ACTIVITY LOG =============

export async function logActivity(
  deptId,
  activityType,
  contentPreview,
  messageId = null,
) {
  const user = await getCurrentUser();
  const { error } = await supabase.from("activity_log").insert([
    {
      department_id: deptId,
      user_id: user.id,
      activity_type: activityType,
      content_preview: contentPreview,
      related_message_id: messageId,
      is_read: false,
    },
  ]);

  if (error) throw error;
}

export async function getActivityLog(deptId) {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*, users:user_id(id, username, full_name, avatar_url)")
    .eq("department_id", deptId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}
