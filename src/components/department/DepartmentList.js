"use client";

import { useState } from "react";

const DepartmentList = ({
  departments = [],
  selectedDept = null,
  onSelectDept = () => {},
  onCreateDept = () => {},
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDepartment = async () => {
    if (!deptName.trim()) return;

    try {
      setIsCreating(true);
      await onCreateDept(deptName, deptDesc);
      setDeptName("");
      setDeptDesc("");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating department:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-3">Departments</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          + New Department
        </button>
      </div>

      {/* Departments List */}
      <div className="space-y-2">
        {departments.map((dept) => (
          <div
            key={dept.id}
            onClick={() => onSelectDept(dept)}
            className={`p-3 rounded cursor-pointer transition ${
              selectedDept?.id === dept.id
                ? "bg-blue-100 border-l-4 border-blue-600"
                : "hover:bg-gray-200"
            }`}
          >
            <div className="font-medium text-sm"># {dept.name}</div>
            {dept.description && (
              <div className="text-xs text-gray-600 mt-1">
                {dept.description}
              </div>
            )}
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="text-center text-gray-500 text-sm mt-8">
          No departments yet. Create one!
        </div>
      )}

      {/* Create Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Create Department</h3>

            <input
              type="text"
              placeholder="Department name (e.g., Engineering)"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-3"
              autoFocus
            />

            <textarea
              placeholder="Description (optional)"
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
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
                onClick={handleCreateDepartment}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={!deptName.trim() || isCreating}
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

export default DepartmentList;
