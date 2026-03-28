"use client";

import { useState, useEffect } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { useDepartment } from "@/hooks/useDepartment";
import { useChat } from "@/hooks/useWebSocket";
import {
  getMeetings,
  getTasks,
  getFiles,
  getAttendance,
  getShifts,
  getPraise,
  getApprovalRequests,
  getOnlineUsers,
  getUserOrganizations,
} from "@/lib/supabase-api-extended";
import OrganizationList from "@/components/organization/OrganizationList";
import DepartmentList from "@/components/department/DepartmentList";
import MembersList from "@/components/members/MembersList";

const OrgView = ({ presence = "available" }) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showScreenShare, setShowScreenShare] = useState(false);

  // Organization & Department State
  const {
    organizations,
    selectedOrg,
    setSelectedOrg,
    loading: orgLoading,
  } = useOrganization();

  const {
    departments,
    selectedDept,
    setSelectedDept,
    loading: deptLoading,
  } = useDepartment(selectedOrg?.id);

  // Real-time Chat
  const { messages, typing, sendMessage, addReaction } = useChat(
    selectedDept?.id,
    null,
    "User",
  );

  // Real Data State
  const [meetingsData, setMeetingsData] = useState([]);
  const [tasksData, setTasksData] = useState([]);
  const [filesData, setFilesData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [shiftsData, setShiftsData] = useState([]);
  const [praiseData, setPraiseData] = useState([]);
  const [approvalsData, setApprovalsData] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load all data when department changes
  useEffect(() => {
    if (!selectedDept?.id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [
          meetings,
          tasks,
          files,
          attendance,
          shifts,
          praise,
          approvals,
          online,
        ] = await Promise.all([
          getMeetings(selectedDept.id),
          getTasks(selectedDept.id),
          getFiles(selectedDept.id),
          getAttendance(selectedDept.id),
          getShifts(selectedDept.id),
          getPraise(selectedDept.id),
          getApprovalRequests(selectedDept.id),
          getOnlineUsers(selectedDept.id),
        ]);

        setMeetingsData(meetings || []);
        setTasksData(tasks || []);
        setFilesData(files || []);
        setAttendanceData(attendance || []);
        setShiftsData(shifts || []);
        setPraiseData(praise || []);
        setApprovalsData(approvals || []);
        setOnlineUsers(online || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDept?.id]);

  const PRESENCE = {
    available: "🟢 Available",
    busy: "🔴 Busy",
    dnd: "🔕 Do not disturb",
    brb: "🟡 Be right back",
    away: "⚪ Away",
  };

  return (
    <div style={{ display: "flex", height: "100vh", flex: 1 }}>
      {/* Organization & Team List */}
      <div
        style={{
          width: "var(--nav-pane-width, 280px)",
          background: "hsl(var(--bg-secondary))",
          borderRight: "1px solid hsl(var(--border-subtle))",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid hsl(var(--border-subtle))",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "700",
              marginBottom: "16px",
              color: "hsl(var(--text-primary))",
            }}
          >
            Organizations
          </h2>
        </div>

        <div className="scrollable" style={{ flex: 1 }}>
          {orgLoading ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "hsl(var(--text-muted))",
              }}
            >
              Loading...
            </div>
          ) : organizations.length > 0 ? (
            organizations.map((org) => (
              <div key={org.id} style={{ marginBottom: "8px" }}>
                <div
                  onClick={() =>
                    setSelectedOrg(selectedOrg?.id === org.id ? null : org)
                  }
                  style={{
                    padding: "16px 20px",
                    cursor: "pointer",
                    background:
                      selectedOrg?.id === org.id
                        ? "hsl(var(--bg-tertiary))"
                        : "transparent",
                    transition: "all var(--transition-fast)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div style={{ fontSize: "24px" }}>{org.icon || "🏢"}</div>
                  <span
                    style={{
                      fontWeight: "600",
                      color: "hsl(var(--text-primary))",
                    }}
                  >
                    {org.name}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "12px",
                      color: "hsl(var(--text-muted))",
                    }}
                  >
                    {selectedOrg?.id === org.id ? "▼" : "▶"}
                  </span>
                </div>

                {selectedOrg?.id === org.id && (
                  <DepartmentList
                    orgId={org.id}
                    selectedDept={selectedDept}
                    onSelectDept={setSelectedDept}
                  />
                )}
              </div>
            ))
          ) : (
            <div style={{ padding: "20px", color: "hsl(var(--text-muted))" }}>
              No organizations yet. Create one to start!
            </div>
          )}
        </div>
      </div>

      {/* Team Workspace */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "hsl(var(--bg-primary))",
        }}
      >
        {selectedDept ? (
          <>
            {/* Command Bar */}
            <div
              style={{
                padding: "12px 24px",
                borderBottom: "1px solid hsl(var(--border-subtle))",
                background: "hsl(var(--bg-secondary))",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 12px",
                  background: "hsl(var(--bg-tertiary))",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "13px",
                  color: "hsl(var(--text-secondary))",
                }}
              >
                <span>{PRESENCE[presence]}</span>
              </div>

              <div style={{ flex: 1, maxWidth: "400px", position: "relative" }}>
                <input
                  type="text"
                  placeholder="Search or type a command..."
                  className="input-field"
                  style={{ paddingLeft: "36px" }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  🔍
                </span>
              </div>
            </div>

            {/* Department Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid hsl(var(--border-subtle))",
                background: "hsl(var(--bg-secondary))",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "hsl(var(--text-primary))",
                  }}
                >
                  {selectedDept.name}
                </h2>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn-ghost"
                    style={{ padding: "8px 12px", fontSize: "14px" }}
                    onClick={() => setShowWhiteboard(true)}
                  >
                    🎨 Whiteboard
                  </button>
                  <button
                    className="btn-ghost"
                    style={{ padding: "8px 12px", fontSize: "14px" }}
                    onClick={() => setShowScreenShare(true)}
                  >
                    🖥️ Share Screen
                  </button>
                  <button
                    className="btn-primary"
                    style={{ padding: "8px 16px", fontSize: "14px" }}
                    onClick={() => setShowMeetingModal(true)}
                  >
                    📅 Schedule Meeting
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  "chat",
                  "files",
                  "meetings",
                  "tasks",
                  "attendance",
                  "approvals",
                  "praise",
                  "shifts",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      cursor: "pointer",
                      background:
                        activeTab === tab
                          ? "hsl(var(--accent-tertiary))"
                          : "transparent",
                      color:
                        activeTab === tab
                          ? "white"
                          : "hsl(var(--text-secondary))",
                      fontWeight: "600",
                      fontSize: "14px",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div
              className="scrollable"
              style={{ flex: 1, padding: "24px", overflowY: "auto" }}
            >
              {/* CHAT TAB */}
              {activeTab === "chat" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "14px",
                      color: "hsl(var(--text-muted))",
                    }}
                  >
                    💬 Real-time team chat with {onlineUsers.length} online
                  </p>

                  {/* Messages */}
                  {messages.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        color: "hsl(var(--text-muted))",
                      }}
                    >
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                        💬
                      </div>
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="glass"
                        style={{
                          padding: "16px",
                          borderRadius: "var(--radius-md)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "flex-start",
                          }}
                        >
                          <div style={{ fontSize: "32px" }}>
                            {msg.users?.avatar_url || "👤"}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: "600",
                                color: "hsl(var(--text-primary))",
                              }}
                            >
                              {msg.users?.full_name || "Unknown"}
                            </div>
                            <div
                              style={{
                                color: "hsl(var(--text-secondary))",
                                marginBottom: "8px",
                              }}
                            >
                              {msg.content}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "hsl(var(--text-muted))",
                              }}
                            >
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Typing Indicator */}
                  {typing.length > 0 && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "hsl(var(--text-muted))",
                      }}
                    >
                      {typing.join(", ")} {typing.length === 1 ? "is" : "are"}{" "}
                      typing...
                    </div>
                  )}

                  {/* Message Input */}
                  <div
                    className="glass"
                    style={{
                      padding: "16px",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "flex-end",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="input-field"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(e.target.value);
                            e.target.value = "";
                          }
                        }}
                      />
                      <button
                        className="btn-primary"
                        style={{ padding: "10px 16px", fontSize: "13px" }}
                        onClick={(e) => {
                          const input =
                            e.target.parentElement.querySelector("input");
                          sendMessage(input.value);
                          input.value = "";
                        }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* FILES TAB */}
              {activeTab === "files" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "hsl(var(--text-primary))",
                      }}
                    >
                      Shared Files
                    </h3>
                    <button
                      className="btn-primary"
                      style={{ padding: "8px 16px" }}
                    >
                      📤 Upload File
                    </button>
                  </div>

                  {filesData.length === 0 ? (
                    <div
                      className="glass"
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        borderRadius: "var(--radius-md)",
                        color: "hsl(var(--text-muted))",
                      }}
                    >
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                        📁
                      </div>
                      <p>No files shared yet</p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {filesData.map((file) => (
                        <div
                          key={file.id}
                          className="glass"
                          style={{
                            padding: "16px",
                            borderRadius: "var(--radius-md)",
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "32px",
                              width: "48px",
                              height: "48px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            📄
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: "600",
                                color: "hsl(var(--text-primary))",
                              }}
                            >
                              {file.file_name}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "hsl(var(--text-muted))",
                              }}
                            >
                              {(file.file_size / 1024).toFixed(1)} KB • Uploaded
                              by {file.users?.full_name}
                            </div>
                          </div>
                          <button
                            className="btn-ghost"
                            style={{ padding: "8px 12px" }}
                          >
                            ⬇️ Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* MEETINGS TAB */}
              {activeTab === "meetings" && (
                <div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      marginBottom: "20px",
                      color: "hsl(var(--text-primary))",
                    }}
                  >
                    Scheduled Meetings
                  </h3>

                  {meetingsData.length === 0 ? (
                    <div
                      className="glass"
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        borderRadius: "var(--radius-md)",
                        color: "hsl(var(--text-muted))",
                      }}
                    >
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                        📹
                      </div>
                      <p>No meetings scheduled</p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {meetingsData.map((meeting) => (
                        <div
                          key={meeting.id}
                          className="glass"
                          style={{ padding: "20px" }}
                        >
                          <h4
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              marginBottom: "8px",
                            }}
                          >
                            {meeting.title}
                          </h4>
                          <p
                            style={{
                              color: "hsl(var(--text-secondary))",
                              marginBottom: "8px",
                            }}
                          >
                            {meeting.description}
                          </p>
                          <div
                            style={{
                              color: "hsl(var(--text-muted))",
                              fontSize: "13px",
                            }}
                          >
                            📅 {new Date(meeting.start_time).toLocaleString()} •{" "}
                            {meeting.meeting_attendees?.length || 0} attendees
                          </div>
                          <button
                            className="btn-primary"
                            style={{ marginTop: "12px", padding: "8px 16px" }}
                          >
                            📹 Join Meeting
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TASKS TAB */}
              {activeTab === "tasks" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <h3 style={{ fontSize: "18px", fontWeight: "600" }}>
                      Team Tasks
                    </h3>
                    <button
                      className="btn-primary"
                      onClick={() => setShowTaskModal(true)}
                      style={{ padding: "8px 16px" }}
                    >
                      ➕ New Task
                    </button>
                  </div>

                  {tasksData.length === 0 ? (
                    <div
                      className="glass"
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        borderRadius: "var(--radius-md)",
                        color: "hsl(var(--text-muted))",
                      }}
                    >
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                        ✅
                      </div>
                      <p>No tasks yet. Create one to get started!</p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {tasksData.map((task) => (
                        <div
                          key={task.id}
                          className="glass"
                          style={{
                            padding: "16px",
                            borderRadius: "var(--radius-md)",
                            borderLeft: `4px solid ${
                              task.priority === "high"
                                ? "hsl(var(--accent-warning))"
                                : task.priority === "medium"
                                  ? "hsl(var(--accent-primary))"
                                  : "hsl(var(--text-muted))"
                            }`,
                          }}
                        >
                          <h4 style={{ fontSize: "15px", fontWeight: "600" }}>
                            {task.title}
                          </h4>
                          <p
                            style={{
                              fontSize: "13px",
                              color: "hsl(var(--text-muted))",
                            }}
                          >
                            Assigned to:{" "}
                            {task.assigned_user?.full_name || "Unassigned"}
                          </p>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "hsl(var(--text-muted))",
                            }}
                          >
                            Due: {new Date(task.due_date).toLocaleDateString()}{" "}
                            • <span>{task.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ATTENDANCE TAB */}
              {activeTab === "attendance" && (
                <div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      marginBottom: "20px",
                    }}
                  >
                    Attendance Records
                  </h3>

                  {attendanceData.length === 0 ? (
                    <div
                      className="glass"
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        borderRadius: "var(--radius-md)",
                        color: "hsl(var(--text-muted))",
                      }}
                    >
                      No attendance records
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {attendanceData.map((record) => (
                        <div
                          key={record.id}
                          className="glass"
                          style={{ padding: "16px" }}
                        >
                          <div style={{ fontWeight: "600" }}>
                            {record.users?.full_name}
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "hsl(var(--text-muted))",
                            }}
                          >
                            Sign In: {record.sign_in_time ? "Yes" : "No"} | Sign
                            Out: {record.sign_out_time ? "Yes" : "No"} | Hours:{" "}
                            {record.total_hours}h
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* APPROVALS TAB */}
              {activeTab === "approvals" && (
                <div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      marginBottom: "20px",
                    }}
                  >
                    Approvals
                  </h3>

                  {approvalsData.length === 0 ? (
                    <div
                      className="glass"
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        borderRadius: "var(--radius-md)",
                        color: "hsl(var(--text-muted))",
                      }}
                    >
                      No pending approvals
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {approvalsData.map((approval) => (
                        <div
                          key={approval.id}
                          className="glass"
                          style={{ padding: "16px" }}
                        >
                          <h4 style={{ fontWeight: "600" }}>
                            {approval.title}
                          </h4>
                          <p
                            style={{
                              fontSize: "13px",
                              color: "hsl(var(--text-muted))",
                            }}
                          >
                            {approval.request_type} • {approval.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PRAISE TAB */}
              {activeTab === "praise" && (
                <div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      marginBottom: "20px",
                    }}
                  >
                    Recognition
                  </h3>

                  {praiseData.length === 0 ? (
                    <div
                      className="glass"
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        borderRadius: "var(--radius-md)",
                        color: "hsl(var(--text-muted))",
                      }}
                    >
                      No praise yet. Send some to your teammates!
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {praiseData.map((praise) => (
                        <div
                          key={praise.id}
                          className="glass"
                          style={{ padding: "16px" }}
                        >
                          <div
                            style={{ fontSize: "24px", marginBottom: "8px" }}
                          >
                            {praise.badge?.split(" ")[0]}
                          </div>
                          <p style={{ fontWeight: "600" }}>
                            {praise.from_user?.full_name} →{" "}
                            {praise.to_user?.full_name}
                          </p>
                          <p style={{ fontSize: "13px", fontStyle: "italic" }}>
                            "{praise.message}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SHIFTS TAB */}
              {activeTab === "shifts" && (
                <div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      marginBottom: "20px",
                    }}
                  >
                    Shifts
                  </h3>

                  {shiftsData.length === 0 ? (
                    <div
                      className="glass"
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        borderRadius: "var(--radius-md)",
                        color: "hsl(var(--text-muted))",
                      }}
                    >
                      No shifts scheduled
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {shiftsData.map((shift) => (
                        <div
                          key={shift.id}
                          className="glass"
                          style={{
                            padding: "16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: "600" }}>
                              {shift.users?.full_name}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "hsl(var(--text-muted))",
                              }}
                            >
                              {shift.role}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div>
                              {shift.start_time} - {shift.end_time}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "hsl(var(--text-muted))",
                              }}
                            >
                              {new Date(shift.shift_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modals */}
            {showMeetingModal && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                }}
                onClick={() => setShowMeetingModal(false)}
              >
                <div
                  className="glass"
                  style={{
                    padding: "32px",
                    borderRadius: "var(--radius-lg)",
                    maxWidth: "500px",
                    width: "90%",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      marginBottom: "20px",
                    }}
                  >
                    Schedule New Meeting
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Meeting Title"
                      className="input-field"
                    />
                    <input type="date" className="input-field" />
                    <input
                      type="time"
                      placeholder="Start Time"
                      className="input-field"
                    />
                    <input
                      type="time"
                      placeholder="End Time"
                      className="input-field"
                    />
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        className="btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => setShowMeetingModal(false)}
                      >
                        Create Meeting
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ flex: 1 }}
                        onClick={() => setShowMeetingModal(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showTaskModal && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                }}
                onClick={() => setShowTaskModal(false)}
              >
                <div
                  className="glass"
                  style={{
                    padding: "32px",
                    borderRadius: "var(--radius-lg)",
                    maxWidth: "500px",
                    width: "90%",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      marginBottom: "20px",
                    }}
                  >
                    Create New Task
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Task Title"
                      className="input-field"
                    />
                    <textarea
                      placeholder="Description"
                      className="input-field"
                      rows="3"
                    />
                    <select className="input-field">
                      <option>Assign to...</option>
                      {/* Department members go here */}
                    </select>
                    <input type="date" className="input-field" />
                    <select className="input-field">
                      <option>Priority</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        className="btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => setShowTaskModal(false)}
                      >
                        Create Task
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ flex: 1 }}
                        onClick={() => setShowTaskModal(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showWhiteboard && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.9)",
                  display: "flex",
                  flexDirection: "column",
                  zIndex: 1000,
                }}
              >
                <button
                  style={{
                    padding: "20px",
                    background: "transparent",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    textAlign: "right",
                  }}
                  onClick={() => setShowWhiteboard(false)}
                >
                  ✕ Close
                </button>
                <div
                  style={{
                    flex: 1,
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "hsl(var(--text-muted))",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "64px", marginBottom: "16px" }}>
                      🎨
                    </div>
                    <div>
                      Whiteboard Canvas - Draw and collaborate in real-time
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showScreenShare && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                }}
                onClick={() => setShowScreenShare(false)}
              >
                <div
                  className="glass"
                  style={{
                    padding: "32px",
                    borderRadius: "var(--radius-lg)",
                    maxWidth: "600px",
                    width: "90%",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      marginBottom: "20px",
                    }}
                  >
                    Share Your Screen
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <button className="btn-primary" style={{ padding: "16px" }}>
                      🖥️ Entire Screen
                    </button>
                    <button className="btn-ghost" style={{ padding: "16px" }}>
                      🪟 Application Window
                    </button>
                    <button className="btn-ghost" style={{ padding: "16px" }}>
                      📑 Browser Tab
                    </button>
                  </div>
                  <button
                    className="btn-ghost"
                    style={{ width: "100%", marginTop: "16px" }}
                    onClick={() => setShowScreenShare(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            <div style={{ fontSize: "64px" }}>🏢</div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "hsl(var(--text-secondary))",
              }}
            >
              Select an organization and department to get started
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgView;
