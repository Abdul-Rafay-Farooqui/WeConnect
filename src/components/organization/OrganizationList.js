"use client";

import { useState } from "react";

const OrganizationList = ({
  organizations = [],
  selectedOrg = null,
  onSelectOrg = () => {},
  onCreateOrg = () => {},
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgIcon, setOrgIcon] = useState("🏢");
  const [orgDesc, setOrgDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const ICON_SUGGESTIONS = [
    "🏢",
    "🚀",
    "🎓",
    "💻",
    "🏭",
    "🏦",
    "🏥",
    "🎨",
    "📱",
    "⚙️",
  ];

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) return;

    try {
      setIsCreating(true);
      await onCreateOrg(orgName, orgIcon, orgDesc);
      setOrgName("");
      setOrgIcon("🏢");
      setOrgDesc("");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating organization:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-64 border-r bg-white p-4 overflow-y-auto h-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-3">Organizations</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          + New Organization
        </button>
      </div>

      {/* Organizations List */}
      <div className="space-y-2">
        {organizations.map((org) => (
          <div
            key={org.id}
            onClick={() => onSelectOrg(org)}
            className={`p-3 rounded cursor-pointer transition ${
              selectedOrg?.id === org.id
                ? "bg-blue-100 border-l-4 border-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{org.icon || "🏢"}</span>
              <div className="flex-1">
                <div className="font-medium text-sm">{org.name}</div>
                {org.description && (
                  <div className="text-xs text-gray-600 truncate">
                    {org.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {organizations.length === 0 && (
        <div className="text-center text-gray-500 text-sm mt-8">
          No organizations yet. Create one!
        </div>
      )}

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Create Organization</h3>

            <input
              type="text"
              placeholder="Organization name (e.g., TechCorp)"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-3"
              autoFocus
            />

            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">
                Choose Icon
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ICON_SUGGESTIONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setOrgIcon(icon)}
                    className={`text-2xl p-2 rounded border-2 ${
                      orgIcon === icon
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              placeholder="Description (optional)"
              value={orgDesc}
              onChange={(e) => setOrgDesc(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4 h-20 resize-none"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrganization}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={!orgName.trim() || isCreating}
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationList;
