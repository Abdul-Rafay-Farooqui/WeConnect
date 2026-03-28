"use client";

import { useState, useEffect } from "react";
import { useOrganization } from "../../../hooks/useOrganization";
import { useDepartment } from "../../../hooks/useDepartment";
import { useMessages } from "../../../hooks/useMessages";
import OrganizationList from "./OrganizationList";
import DepartmentList from "../department/DepartmentList";
import MembersList from "../members/MembersList";

const OrgView = ({ presence = "available" }) => {
  const {
    organizations,
    selectedOrg,
    setSelectedOrg,
    createOrganization,
    loading: orgLoading,
  } = useOrganization();
  const {
    departments,
    selectedDept,
    setSelectedDept,
    createDepartment,
    loading: deptLoading,
  } = useDepartment(selectedOrg?.id);
  const {
    messages,
    sendMessage,
    addReaction,
    loading: messagesLoading,
  } = useMessages(selectedDept?.id);

  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [members, setMembers] = useState([]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      await sendMessage(messageInput);
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gray-50">
        <div className="text-center">
          <div className="text-2xl text-gray-600">Loading organizations...</div>
        </div>
      </div>
    );
  }

  if (!selectedOrg) {
    return (
      <div className="flex h-screen w-full">
        <OrganizationList
          organizations={organizations}
          onCreateOrg={createOrganization}
        />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              No Organization Selected
            </h2>
            <p className="text-gray-600">
              Create or select an organization to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedDept) {
    return (
      <div className="flex h-screen w-full">
        <OrganizationList
          organizations={organizations}
          selectedOrg={selectedOrg}
          onSelectOrg={setSelectedOrg}
          onCreateOrg={createOrganization}
        />
        <DepartmentList
          departments={departments}
          onCreateDept={createDepartment}
        />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              No Department Selected
            </h2>
            <p className="text-gray-600">
              Create or select a department to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      {/* Organization Sidebar */}
      <OrganizationList
        organizations={organizations}
        selectedOrg={selectedOrg}
        onSelectOrg={setSelectedOrg}
        onCreateOrg={createOrganization}
      />

      {/* Department Sidebar */}
      <DepartmentList
        departments={departments}
        selectedDept={selectedDept}
        onSelectDept={setSelectedDept}
        onCreateDept={createDepartment}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="border-b bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {selectedDept.name}
              </h1>
              {selectedDept.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {selectedDept.description}
                </p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-t pt-4">
            {["chat", "files", "meetings", "tasks", "members"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded font-medium text-sm transition ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "chat" && (
            <div className="flex flex-col h-full">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="text-center text-gray-500">
                    Loading messages...
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((msg) => (
                    <div key={msg.id} className="bg-gray-50 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">👤</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-gray-800">
                              {msg.users?.full_name ||
                                msg.users?.username ||
                                "Unknown"}
                            </strong>
                            <span className="text-xs text-gray-500">
                              {msg.created_at &&
                                new Date(msg.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1">{msg.content}</p>
                          {msg.message_reactions &&
                            msg.message_reactions.length > 0 && (
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {msg.message_reactions.map((reaction, idx) => (
                                  <span
                                    key={idx}
                                    className="text-sm bg-gray-200 px-2 py-1 rounded"
                                  >
                                    {reaction.emoji}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 mt-8">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t p-4 bg-gray-50">
                <div className="flex gap-2">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                    className="flex-1 p-3 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
                    rows="3"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || messagesLoading}
                    className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium self-end"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Shared Files</h2>
              <div className="text-center py-12 text-gray-500">
                No files yet. Upload one to get started!
              </div>
            </div>
          )}

          {activeTab === "meetings" && (
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Meetings</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  + Schedule Meeting
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                No meetings scheduled yet.
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Tasks</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  + Create Task
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                No tasks yet. Create one to get started!
              </div>
            </div>
          )}

          {activeTab === "members" && <MembersList members={members} />}
        </div>
      </div>
    </div>
  );
};

export default OrgView;
