const OrganizationSidebar = ({
  organizations,
  selectedOrg,
  setSelectedOrg,
  selectedTeam,
  setSelectedTeam,
  isLoading = false,
  error = "",
  onRetry,
  onCreateOrganization,
  onCreateTeam,
  onAddOrgMembers,
}) => (
  <div
    style={{
      width: "var(--nav-pane-width)",
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
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          className="btn-ghost"
          style={{ fontSize: "12px", padding: "6px 10px" }}
          onClick={onCreateOrganization}
        >
          + Org
        </button>
        <button
          className="btn-ghost"
          style={{ fontSize: "12px", padding: "6px 10px" }}
          onClick={onCreateTeam}
          disabled={!selectedOrg}
          title={!selectedOrg ? "Select an organization first" : "Create team"}
        >
          + Team
        </button>
        <button
          className="btn-ghost"
          style={{ fontSize: "12px", padding: "6px 10px" }}
          onClick={onAddOrgMembers}
          disabled={!selectedOrg}
          title={
            !selectedOrg
              ? "Select an organization first"
              : "Add organization members"
          }
        >
          + Members
        </button>
      </div>
      {isLoading && (
        <div style={{ fontSize: "12px", color: "hsl(var(--text-muted))" }}>
          Loading organizations...
        </div>
      )}
      {!isLoading && error && (
        <button
          className="btn-ghost"
          style={{ fontSize: "12px", padding: "6px 10px" }}
          onClick={onRetry}
        >
          Retry load
        </button>
      )}
    </div>

    <div className="scrollable" style={{ flex: 1 }}>
      {!isLoading && !organizations.length && (
        <div
          style={{
            padding: "16px 20px",
            fontSize: "13px",
            color: "hsl(var(--text-muted))",
          }}
        >
          No organizations found.
        </div>
      )}
      {organizations.map((org) => (
        <div key={org.id} style={{ marginBottom: "8px" }}>
          <div
            onClick={() =>
              setSelectedOrg(selectedOrg === org.id ? null : org.id)
            }
            style={{
              padding: "16px 20px",
              cursor: "pointer",
              background:
                selectedOrg === org.id
                  ? "hsl(var(--bg-tertiary))"
                  : "transparent",
              transition: "all var(--transition-fast)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
            onMouseEnter={(e) => {
              if (selectedOrg !== org.id)
                e.currentTarget.style.background = "hsl(var(--bg-glass))";
            }}
            onMouseLeave={(e) => {
              if (selectedOrg !== org.id)
                e.currentTarget.style.background = "transparent";
            }}
          >
            <div style={{ fontSize: "24px" }}>{org.icon}</div>
            <span
              style={{ fontWeight: "600", color: "hsl(var(--text-primary))" }}
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
              {selectedOrg === org.id ? "▼" : "▶"}
            </span>
          </div>

          {selectedOrg === org.id && (
            <div style={{ paddingLeft: "20px" }}>
              {!org.teams?.length && (
                <div
                  style={{
                    padding: "10px 20px",
                    fontSize: "12px",
                    color: "hsl(var(--text-muted))",
                  }}
                >
                  No teams yet
                </div>
              )}
              {(org.teams || []).map((team) => {
                const teamId = typeof team === "string" ? team : team.id;
                const teamName = typeof team === "string" ? team : team.name;
                const isSelected = selectedTeam?.id === teamId;

                return (
                  <div
                    key={teamId}
                    onClick={() =>
                      setSelectedTeam({ id: teamId, name: teamName })
                    }
                    style={{
                      padding: "12px 20px",
                      cursor: "pointer",
                      background: isSelected
                        ? "hsl(var(--accent-tertiary) / 0.2)"
                        : "transparent",
                      borderLeft: isSelected
                        ? "3px solid hsl(var(--accent-tertiary))"
                        : "3px solid transparent",
                      transition: "all var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background =
                          "hsl(var(--bg-glass))";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        color: "hsl(var(--text-secondary))",
                      }}
                    >
                      👥 {teamName}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default OrganizationSidebar;
