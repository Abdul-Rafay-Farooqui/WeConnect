"use client";

import { useEffect, useMemo, useState } from "react";
import EmptyTeamState from "./EmptyTeamState";
import OrganizationSidebar from "./OrganizationSidebar";
import TeamModals from "./TeamModals";
import TeamTabContent from "./TeamTabContent";
import TeamWorkspaceHeader from "./TeamWorkspaceHeader";
import WorkspaceCommandBar from "./WorkspaceCommandBar";
import { teamData as defaultTeamData } from "./constants";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

const OrgView = ({ presence = "available", presenceOptions = [] }) => {
  const [organizations, setOrganizations] = useState([]);
  const [orgTeamsById, setOrgTeamsById] = useState({});
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamData, setTeamData] = useState(defaultTeamData);
  const [activeTab, setActiveTab] = useState("chat");
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showScreenShare, setShowScreenShare] = useState(false);
  const [showMeetingOptions, setShowMeetingOptions] = useState(false);
  const [commandBarQuery, setCommandBarQuery] = useState("");
  const [isOrgsLoading, setIsOrgsLoading] = useState(true);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
  const [error, setError] = useState("");

  const parseIds = (value) =>
    (value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const organizationsWithTeams = useMemo(
    () =>
      organizations.map((org) => ({
        ...org,
        icon: org.icon || "🏢",
        teams: orgTeamsById[org.id] || [],
      })),
    [organizations, orgTeamsById],
  );

  const loadOrganizations = async () => {
    try {
      setIsOrgsLoading(true);
      setError("");
      const response = await fetch(`${API_BASE}/organizations`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Failed to load organizations (${response.status})`);
      }
      const data = await response.json();
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Unable to load organizations");
    } finally {
      setIsOrgsLoading(false);
    }
  };

  const loadOrganizationTeams = async (organizationId, force = false) => {
    if (!organizationId) return;
    if (!force && orgTeamsById[organizationId]) return;
    try {
      setError("");
      const response = await fetch(
        `${API_BASE}/organizations/${organizationId}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error(
          `Failed to load organization details (${response.status})`,
        );
      }
      const data = await response.json();
      const teams = Array.isArray(data?.teams) ? data.teams : [];
      setOrgTeamsById((prev) => ({ ...prev, [organizationId]: teams }));
    } catch (err) {
      setError(err?.message || "Unable to load teams");
    }
  };

  const loadTeamWorkspace = async (organizationId, teamId) => {
    if (!organizationId || !teamId) return;
    try {
      setIsWorkspaceLoading(true);
      setError("");
      const response = await fetch(
        `${API_BASE}/organizations/${organizationId}/teams/${teamId}/workspace`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to load team workspace (${response.status})`);
      }
      const data = await response.json();
      setTeamData({ ...defaultTeamData, ...(data?.tabs || {}) });
    } catch (err) {
      setError(err?.message || "Unable to load team workspace");
      setTeamData(defaultTeamData);
    } finally {
      setIsWorkspaceLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      loadOrganizationTeams(selectedOrg);
    }
  }, [selectedOrg]);

  useEffect(() => {
    if (selectedOrg && selectedTeam?.id) {
      loadTeamWorkspace(selectedOrg, selectedTeam.id);
    }
  }, [selectedOrg, selectedTeam?.id]);

  const handleSelectOrg = (organizationId) => {
    if (selectedOrg === organizationId) {
      setSelectedOrg(null);
      setSelectedTeam(null);
      setTeamData(defaultTeamData);
      return;
    }
    setSelectedOrg(organizationId);
    setSelectedTeam(null);
    setTeamData(defaultTeamData);
  };

  const handleCreateOrganization = async () => {
    const name = window.prompt("Organization name");
    if (!name?.trim()) return;

    const slug = window.prompt("Slug (optional)", "") || "";

    try {
      setError("");
      const response = await fetch(`${API_BASE}/organizations`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          ...(slug.trim() ? { slug: slug.trim() } : {}),
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to create organization (${response.status})`);
      }
      const created = await response.json();
      await loadOrganizations();
      if (created?.id) {
        setSelectedOrg(created.id);
        await loadOrganizationTeams(created.id, true);
      }
    } catch (err) {
      setError(err?.message || "Unable to create organization");
    }
  };

  const handleCreateTeam = async () => {
    if (!selectedOrg) {
      setError("Select an organization first");
      return;
    }

    const name = window.prompt("Team name");
    if (!name?.trim()) return;

    const memberIdsInput =
      window.prompt("Team member user IDs (comma separated, optional)", "") ||
      "";
    const member_ids = parseIds(memberIdsInput);

    try {
      setError("");
      const response = await fetch(
        `${API_BASE}/organizations/${selectedOrg}/teams`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), member_ids }),
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to create team (${response.status})`);
      }
      const created = await response.json();
      await loadOrganizationTeams(selectedOrg, true);
      if (created?.id) {
        setSelectedTeam({ id: created.id, name: created.name || name.trim() });
      }
    } catch (err) {
      setError(err?.message || "Unable to create team");
    }
  };

  const handleAddOrgMembers = async () => {
    if (!selectedOrg) {
      setError("Select an organization first");
      return;
    }

    const raw =
      window.prompt("Organization member user IDs (comma separated)", "") || "";
    const member_ids = parseIds(raw);
    if (!member_ids.length) return;

    try {
      setError("");
      const response = await fetch(
        `${API_BASE}/organizations/${selectedOrg}/members`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ member_ids }),
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to add members (${response.status})`);
      }
      await loadOrganizationTeams(selectedOrg, true);
    } catch (err) {
      setError(err?.message || "Unable to add organization members");
    }
  };

  const handleAddTeamMembers = async () => {
    if (!selectedOrg || !selectedTeam?.id) {
      setError("Select a team first");
      return;
    }

    const raw =
      window.prompt("Team member user IDs (comma separated)", "") || "";
    const member_ids = parseIds(raw);
    if (!member_ids.length) return;

    try {
      setError("");
      const response = await fetch(
        `${API_BASE}/organizations/${selectedOrg}/teams/${selectedTeam.id}/members`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ member_ids }),
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to add team members (${response.status})`);
      }
      await loadTeamWorkspace(selectedOrg, selectedTeam.id);
    } catch (err) {
      setError(err?.message || "Unable to add team members");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", flex: 1 }}>
      <OrganizationSidebar
        organizations={organizationsWithTeams}
        selectedOrg={selectedOrg}
        setSelectedOrg={handleSelectOrg}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        isLoading={isOrgsLoading}
        error={error}
        onRetry={loadOrganizations}
        onCreateOrganization={handleCreateOrganization}
        onCreateTeam={handleCreateTeam}
        onAddOrgMembers={handleAddOrgMembers}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "hsl(var(--bg-primary))",
        }}
      >
        {error && (
          <div
            style={{
              margin: "16px 24px 0",
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              background: "hsl(var(--accent-danger) / 0.15)",
              color: "hsl(var(--text-primary))",
              fontSize: "13px",
              border: "1px solid hsl(var(--accent-danger) / 0.3)",
            }}
          >
            {error}
          </div>
        )}
        {selectedTeam ? (
          <>
            <WorkspaceCommandBar
              presence={presence}
              presenceOptions={presenceOptions}
              commandBarQuery={commandBarQuery}
              setCommandBarQuery={setCommandBarQuery}
            />
            <TeamWorkspaceHeader
              selectedTeam={selectedTeam.name}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setShowWhiteboard={setShowWhiteboard}
              setShowScreenShare={setShowScreenShare}
              setShowMeetingModal={setShowMeetingModal}
              onCreateTeam={handleCreateTeam}
              onAddTeamMembers={handleAddTeamMembers}
            />
            <div
              className="scrollable gradient-mesh"
              style={{ flex: 1, padding: "24px" }}
            >
              {isWorkspaceLoading && (
                <div
                  style={{
                    marginBottom: "12px",
                    fontSize: "13px",
                    color: "hsl(var(--text-muted))",
                  }}
                >
                  Loading team workspace...
                </div>
              )}
              <TeamTabContent
                activeTab={activeTab}
                teamData={teamData}
                setShowMeetingOptions={setShowMeetingOptions}
                setShowTaskModal={setShowTaskModal}
              />
            </div>
            <TeamModals
              showMeetingModal={showMeetingModal}
              setShowMeetingModal={setShowMeetingModal}
              showMeetingOptions={showMeetingOptions}
              setShowMeetingOptions={setShowMeetingOptions}
              showTaskModal={showTaskModal}
              setShowTaskModal={setShowTaskModal}
              showWhiteboard={showWhiteboard}
              setShowWhiteboard={setShowWhiteboard}
              showScreenShare={showScreenShare}
              setShowScreenShare={setShowScreenShare}
            />
          </>
        ) : (
          <EmptyTeamState />
        )}
      </div>
    </div>
  );
};

export default OrgView;
