-- ============================================================================
-- ChatWave / WEConnect — Organization Module Schema (v1)
--
-- HOW TO USE:
--   Run this file AFTER your existing base schema files (schema1 + schema2).
--   This script is additive and safe to re-run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ORGANIZATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                TEXT NOT NULL,
    slug                TEXT UNIQUE,
    description         TEXT,
    logo_url            TEXT,
    website_url         TEXT,
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS organizations_updated_at ON organizations;
CREATE TRIGGER organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- ORGANIZATION MEMBERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_members (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role                TEXT NOT NULL DEFAULT 'member'
                            CHECK (role IN ('owner','admin','manager','member','guest')),
    title               TEXT,
    department          TEXT,
    employee_code       TEXT,
    joined_at           TIMESTAMPTZ DEFAULT NOW(),
    invited_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    status              TEXT NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active','invited','suspended','left')),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);

DROP TRIGGER IF EXISTS organization_members_updated_at ON organization_members;
CREATE TRIGGER organization_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- TEAMS (inside organizations)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_teams (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    description         TEXT,
    lead_user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    visibility          TEXT NOT NULL DEFAULT 'organization'
                            CHECK (visibility IN ('organization','private')),
    is_active           BOOLEAN DEFAULT TRUE,
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_org_teams_org_id ON organization_teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_teams_lead_id ON organization_teams(lead_user_id);

DROP TRIGGER IF EXISTS organization_teams_updated_at ON organization_teams;
CREATE TRIGGER organization_teams_updated_at
    BEFORE UPDATE ON organization_teams
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- TEAM MEMBERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_members (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id             UUID NOT NULL REFERENCES organization_teams(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role                TEXT NOT NULL DEFAULT 'member'
                            CHECK (role IN ('lead','member','guest')),
    joined_at           TIMESTAMPTZ DEFAULT NOW(),
    added_by            UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- ----------------------------------------------------------------------------
-- TEAM CHAT LINK (ties organization team to chat conversation)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_conversations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id             UUID NOT NULL REFERENCES organization_teams(id) ON DELETE CASCADE,
    conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    type                TEXT NOT NULL DEFAULT 'main'
                            CHECK (type IN ('main','announcement','support','project')),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, conversation_id),
    UNIQUE(team_id, type)
);

CREATE INDEX IF NOT EXISTS idx_team_conversations_team_id ON team_conversations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_conversations_conversation_id ON team_conversations(conversation_id);

-- ----------------------------------------------------------------------------
-- MEETINGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_meetings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id             UUID REFERENCES organization_teams(id) ON DELETE SET NULL,
    title               TEXT NOT NULL,
    description         TEXT,
    starts_at           TIMESTAMPTZ NOT NULL,
    ends_at             TIMESTAMPTZ NOT NULL,
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    location_type       TEXT DEFAULT 'online'
                            CHECK (location_type IN ('online','onsite','hybrid')),
    meeting_link        TEXT,
    status              TEXT NOT NULL DEFAULT 'scheduled'
                            CHECK (status IN ('scheduled','ongoing','completed','cancelled')),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_org_meetings_org_id ON org_meetings(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_meetings_team_id ON org_meetings(team_id);
CREATE INDEX IF NOT EXISTS idx_org_meetings_starts_at ON org_meetings(starts_at);

DROP TRIGGER IF EXISTS org_meetings_updated_at ON org_meetings;
CREATE TRIGGER org_meetings_updated_at
    BEFORE UPDATE ON org_meetings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS org_meeting_attendees (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id          UUID NOT NULL REFERENCES org_meetings(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    response_status     TEXT NOT NULL DEFAULT 'pending'
                            CHECK (response_status IN ('pending','accepted','declined','maybe')),
    attendance_status   TEXT NOT NULL DEFAULT 'not_marked'
                            CHECK (attendance_status IN ('not_marked','attended','absent','late')),
    joined_at           TIMESTAMPTZ,
    left_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(meeting_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_meeting_attendees_meeting_id ON org_meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_org_meeting_attendees_user_id ON org_meeting_attendees(user_id);

-- ----------------------------------------------------------------------------
-- TASKS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_tasks (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id             UUID REFERENCES organization_teams(id) ON DELETE SET NULL,
    title               TEXT NOT NULL,
    description         TEXT,
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    assignee_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    priority            TEXT NOT NULL DEFAULT 'medium'
                            CHECK (priority IN ('low','medium','high','critical')),
    status              TEXT NOT NULL DEFAULT 'todo'
                            CHECK (status IN ('todo','in_progress','blocked','completed','cancelled')),
    due_date            DATE,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_tasks_org_id ON org_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_tasks_team_id ON org_tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_org_tasks_assignee_id ON org_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_org_tasks_status ON org_tasks(status);

DROP TRIGGER IF EXISTS org_tasks_updated_at ON org_tasks;
CREATE TRIGGER org_tasks_updated_at
    BEFORE UPDATE ON org_tasks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- ATTENDANCE + SHIFT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_attendance_logs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attendance_date     DATE NOT NULL,
    sign_in_at          TIMESTAMPTZ,
    sign_out_at         TIMESTAMPTZ,
    status              TEXT NOT NULL DEFAULT 'present'
                            CHECK (status IN ('present','absent','leave','late','active')),
    work_minutes        INTEGER DEFAULT 0,
    source              TEXT DEFAULT 'manual' CHECK (source IN ('manual','auto','biometric')),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_org_attendance_org_date ON org_attendance_logs(organization_id, attendance_date DESC);
CREATE INDEX IF NOT EXISTS idx_org_attendance_user_id ON org_attendance_logs(user_id);

DROP TRIGGER IF EXISTS org_attendance_logs_updated_at ON org_attendance_logs;
CREATE TRIGGER org_attendance_logs_updated_at
    BEFORE UPDATE ON org_attendance_logs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS org_shifts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id             UUID REFERENCES organization_teams(id) ON DELETE SET NULL,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shift_date          DATE NOT NULL,
    starts_at           TIMESTAMPTZ NOT NULL,
    ends_at             TIMESTAMPTZ NOT NULL,
    status              TEXT NOT NULL DEFAULT 'scheduled'
                            CHECK (status IN ('scheduled','completed','missed','cancelled')),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_org_shifts_org_date ON org_shifts(organization_id, shift_date DESC);
CREATE INDEX IF NOT EXISTS idx_org_shifts_user_id ON org_shifts(user_id);

DROP TRIGGER IF EXISTS org_shifts_updated_at ON org_shifts;
CREATE TRIGGER org_shifts_updated_at
    BEFORE UPDATE ON org_shifts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- APPROVALS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_approvals (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id             UUID REFERENCES organization_teams(id) ON DELETE SET NULL,
    requested_by        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    approver_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    approval_type       TEXT NOT NULL
                            CHECK (approval_type IN ('leave','purchase','timesheet','expense','other')),
    title               TEXT NOT NULL,
    description         TEXT,
    amount              NUMERIC(12,2),
    status              TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','approved','rejected','cancelled')),
    decided_at          TIMESTAMPTZ,
    decision_note       TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_approvals_org_id ON org_approvals(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_approvals_status ON org_approvals(status);
CREATE INDEX IF NOT EXISTS idx_org_approvals_requested_by ON org_approvals(requested_by);

DROP TRIGGER IF EXISTS org_approvals_updated_at ON org_approvals;
CREATE TRIGGER org_approvals_updated_at
    BEFORE UPDATE ON org_approvals
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- PRAISE / RECOGNITION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_praise (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id             UUID REFERENCES organization_teams(id) ON DELETE SET NULL,
    from_user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge               TEXT NOT NULL,
    message             TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    CHECK (from_user_id <> to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_praise_org_id ON org_praise(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_praise_to_user_id ON org_praise(to_user_id);

-- ----------------------------------------------------------------------------
-- ACTIVITY FEED
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_activity_logs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id             UUID REFERENCES organization_teams(id) ON DELETE SET NULL,
    actor_id            UUID REFERENCES users(id) ON DELETE SET NULL,
    target_user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    activity_type       TEXT NOT NULL
                            CHECK (activity_type IN (
                                'mention','reply','reaction','file_shared','task_created',
                                'task_updated','meeting_scheduled','approval_request','praise_sent'
                            )),
    reference_table     TEXT,
    reference_id        UUID,
    preview_text        TEXT,
    is_unread           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_activity_org_id ON org_activity_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_activity_target_user_id ON org_activity_logs(target_user_id, is_unread);

-- ----------------------------------------------------------------------------
-- CALL LOGS (organization + team call history)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_call_logs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id             UUID REFERENCES organization_teams(id) ON DELETE SET NULL,
    call_id             UUID REFERENCES calls(id) ON DELETE SET NULL,
    conversation_id     UUID REFERENCES conversations(id) ON DELETE SET NULL,
    initiated_by        UUID REFERENCES users(id) ON DELETE SET NULL,
    call_type           TEXT NOT NULL CHECK (call_type IN ('voice','video')),
    direction           TEXT NOT NULL DEFAULT 'outgoing'
                            CHECK (direction IN ('incoming','outgoing')),
    status              TEXT NOT NULL CHECK (status IN ('ringing','answered','missed','declined','failed','ended')),
    started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at            TIMESTAMPTZ,
    duration_seconds    INTEGER DEFAULT 0,
    recording_url       TEXT,
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE INDEX IF NOT EXISTS idx_org_call_logs_org_id ON org_call_logs(organization_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_call_logs_team_id ON org_call_logs(team_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_call_logs_initiated_by ON org_call_logs(initiated_by, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_call_logs_call_id ON org_call_logs(call_id);

CREATE TABLE IF NOT EXISTS org_call_log_participants (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_log_id         UUID NOT NULL REFERENCES org_call_logs(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_role    TEXT NOT NULL DEFAULT 'participant'
                            CHECK (participant_role IN ('host','cohost','participant')),
    joined_at           TIMESTAMPTZ,
    left_at             TIMESTAMPTZ,
    was_missed          BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(call_log_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_call_log_participants_call_log_id ON org_call_log_participants(call_log_id);
CREATE INDEX IF NOT EXISTS idx_org_call_log_participants_user_id ON org_call_log_participants(user_id);

-- ============================================================================
-- DONE — organization module objects created.
-- ============================================================================
