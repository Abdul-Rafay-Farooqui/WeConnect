"use client";

import { useState } from "react";

const MembersList = ({ members = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = members.filter(
    (member) =>
      member.users?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      member.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "moderator":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">Members ({members.length})</h3>

      <input
        type="text"
        placeholder="Search members..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border rounded mb-4"
      />

      <div className="space-y-2">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded"
          >
            <div className="flex-1">
              <div className="font-medium text-sm">
                {member.users?.full_name || member.users?.username}
              </div>
              <div className="text-xs text-gray-600">
                @{member.users?.username}
              </div>
            </div>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(member.role)}`}
            >
              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
            </span>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center text-gray-500 text-sm mt-8">
          No members found
        </div>
      )}
    </div>
  );
};

export default MembersList;
