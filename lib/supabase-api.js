import { supabase } from "./supabase";

// ============= ORGANIZATIONS =============
export async function createOrganization(name, icon, description = "") {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("organizations")
    .insert([
      {
        name,
        icon,
        description,
        created_by: user.id,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // Add creator as owner
  await supabase.from("organization_members").insert([
    {
      organization_id: data.id,
      user_id: user.id,
      role: "owner",
    },
  ]);

  return data;
}

export async function getUserOrganizations() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("organization_members")
    .select(
      `
      organization_id,
      organizations(*)
    `,
    )
    .eq("user_id", user.id);

  if (error) throw error;
  return data?.map((item) => item.organizations) || [];
}

export async function getOrganization(orgId) {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrganization(orgId, updates) {
  const { data, error } = await supabase
    .from("organizations")
    .update(updates)
    .eq("id", orgId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteOrganization(orgId) {
  const { error } = await supabase
    .from("organizations")
    .delete()
    .eq("id", orgId);

  if (error) throw error;
}

export async function getOrgMembers(orgId) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("*, users:user_id(*)")
    .eq("organization_id", orgId);

  if (error) throw error;
  return data;
}

export async function addOrgMember(orgId, userId, role = "member") {
  const { data, error } = await supabase
    .from("organization_members")
    .insert([
      {
        organization_id: orgId,
        user_id: userId,
        role,
      },
    ])
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
export async function createDepartment(orgId, name, description = "") {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("departments")
    .insert([
      {
        organization_id: orgId,
        name,
        description,
        created_by: user.id,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // Add creator as admin
  await supabase.from("department_members").insert([
    {
      department_id: data.id,
      user_id: user.id,
      role: "admin",
    },
  ]);

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

export async function getDepartment(deptId) {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("id", deptId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateDepartment(deptId, updates) {
  const { data, error } = await supabase
    .from("departments")
    .update(updates)
    .eq("id", deptId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDepartment(deptId) {
  const { error } = await supabase
    .from("departments")
    .delete()
    .eq("id", deptId);

  if (error) throw error;
}

export async function getDeptMembers(deptId) {
  const { data, error } = await supabase
    .from("department_members")
    .select("*, users:user_id(*)")
    .eq("department_id", deptId);

  if (error) throw error;
  return data;
}

export async function addDeptMember(deptId, userId, role = "member") {
  const { data, error } = await supabase
    .from("department_members")
    .insert([
      {
        department_id: deptId,
        user_id: userId,
        role,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeDeptMember(deptId, userId) {
  const { error } = await supabase
    .from("department_members")
    .delete()
    .eq("department_id", deptId)
    .eq("user_id", userId);

  if (error) throw error;
}

// ============= MESSAGES =============
export async function sendMessage(deptId, content) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        department_id: deptId,
        user_id: user.id,
        content,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMessages(deptId, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      users(*),
      message_reactions(emoji, user_id)
    `,
    )
    .eq("department_id", deptId)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

export function subscribeToMessages(deptId, callback) {
  const subscription = supabase
    .channel(`messages_${deptId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `department_id=eq.${deptId}`,
      },
      (payload) => {
        // Fetch full message data with user info
        getMessages(deptId, 1, 0).then((msgs) => {
          if (msgs && msgs.length > 0) {
            callback(msgs[msgs.length - 1]);
          }
        });
      },
    )
    .subscribe();

  return subscription;
}

export async function editMessage(messageId, newContent) {
  const { data, error } = await supabase
    .from("messages")
    .update({ content: newContent, is_edited: true })
    .eq("id", messageId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMessage(messageId) {
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId);

  if (error) throw error;
}

export async function addMessageReaction(messageId, emoji) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("message_reactions")
    .insert([
      {
        message_id: messageId,
        user_id: user.id,
        emoji,
      },
    ])
    .select()
    .single();

  if (error && error.code === "23505") {
    // Already reacted with this emoji, remove instead
    return removeMessageReaction(messageId, emoji);
  }

  if (error) throw error;
  return data;
}

export async function removeMessageReaction(messageId, emoji) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("message_reactions")
    .delete()
    .eq("message_id", messageId)
    .eq("user_id", user.id)
    .eq("emoji", emoji);

  if (error) throw error;
}

// ============= FILES =============
export async function uploadFile(deptId, file) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `dept_${deptId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("files")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("files").getPublicUrl(filePath);

  const { data, error } = await supabase
    .from("files")
    .insert([
      {
        department_id: deptId,
        user_id: user.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: publicUrl,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getFiles(deptId) {
  const { data, error } = await supabase
    .from("files")
    .select("*, users(*)")
    .eq("department_id", deptId)
    .order("uploaded_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteFile(fileId, filePath) {
  // Delete from storage
  await supabase.storage.from("files").remove([filePath]);

  // Delete from database
  const { error } = await supabase.from("files").delete().eq("id", fileId);

  if (error) throw error;
}

// ============= MEETINGS =============
export async function createMeeting(
  deptId,
  title,
  scheduledAt,
  duration = 60,
  description = "",
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("meetings")
    .insert([
      {
        department_id: deptId,
        created_by: user.id,
        title,
        description,
        scheduled_at: scheduledAt,
        duration_minutes: duration,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMeetings(deptId) {
  const { data, error } = await supabase
    .from("meetings")
    .select("*, meeting_attendees(*, users(*))")
    .eq("department_id", deptId)
    .order("scheduled_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMeeting(meetingId) {
  const { data, error } = await supabase
    .from("meetings")
    .select("*, meeting_attendees(*, users(*))")
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

export async function addMeetingAttendee(
  meetingId,
  userId,
  status = "invited",
) {
  const { data, error } = await supabase
    .from("meeting_attendees")
    .insert([
      {
        meeting_id: meetingId,
        user_id: userId,
        status,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMeetingAttendeeStatus(meetingId, status) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("meeting_attendees")
    .update({ status, joined_at: new Date().toISOString() })
    .eq("meeting_id", meetingId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============= TASKS =============
export async function createTask(
  deptId,
  title,
  assignedTo = null,
  dueDate = null,
  description = "",
  priority = "medium",
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        department_id: deptId,
        created_by: user.id,
        title,
        description,
        assigned_to: assignedTo,
        due_date: dueDate,
        priority,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTasks(deptId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, assigned_to(*), created_by(*)")
    .eq("department_id", deptId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTask(taskId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, assigned_to(*), created_by(*)")
    .eq("id", taskId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(taskId, updates) {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
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
