-- WEConnect Organization Module - Complete Database Schema
-- PostgreSQL Schema with RLS Policies
-- Created for Supabase

-- organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- department_members table
CREATE TABLE department_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('manager', 'member')),
  joined_at TIMESTAMP DEFAULT now(),
  UNIQUE(department_id, user_id)
);

-- messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- message_reactions table
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- message_threads table
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- files table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER files_updated_at
BEFORE UPDATE ON files
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_time TIMESTAMP NOT NULL,
  webrtc_room_id TEXT UNIQUE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER meetings_updated_at
BEFORE UPDATE ON meetings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- meeting_participants table
CREATE TABLE meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP,
  left_at TIMESTAMP,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'joined', 'completed', 'declined')),
  UNIQUE(meeting_id, user_id)
);

-- meeting_recordings table
CREATE TABLE meeting_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  duration INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

-- tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- task_comments table
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sign_in_time TIMESTAMP,
  sign_out_time TIMESTAMP,
  status TEXT DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'late', 'half-day')),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(department_id, user_id, date)
);

-- approvals table
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approval_type TEXT NOT NULL CHECK (approval_type IN ('leave', 'overtime', 'budget', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  comments TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER approvals_updated_at
BEFORE UPDATE ON approvals
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- praise_recognition table
CREATE TABLE praise_recognition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  giver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  badge TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- shifts table
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(department_id, name)
);

-- shift_assignments table
CREATE TABLE shift_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(shift_id, user_id, assigned_date)
);

-- calendar_events table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER calendar_events_updated_at
BEFORE UPDATE ON calendar_events
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- user_presence table
CREATE TABLE user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER user_presence_updated_at
BEFORE UPDATE ON user_presence
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- whiteboard table
CREATE TABLE whiteboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  canvas_data JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER whiteboards_updated_at
BEFORE UPDATE ON whiteboards
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE praise_recognition ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their organization's data
CREATE POLICY org_access ON organizations
  FOR SELECT USING (id IN (
    SELECT d.organization_id FROM department_members dm
    JOIN departments d ON d.id = dm.department_id
    WHERE dm.user_id = auth.uid()
  ));

-- Users can view departments they're members of
CREATE POLICY dept_access ON departments
  FOR SELECT USING (id IN (
    SELECT department_id FROM department_members 
    WHERE user_id = auth.uid()
  ));

-- Users can view members of their departments
CREATE POLICY dept_member_access ON department_members
  FOR SELECT USING (department_id IN (
    SELECT department_id FROM department_members 
    WHERE user_id = auth.uid()
  ));

-- Users can view messages in their departments
CREATE POLICY message_access ON messages
  FOR SELECT USING (department_id IN (
    SELECT department_id FROM department_members 
    WHERE user_id = auth.uid()
  ));

-- Users can insert messages to their departments
CREATE POLICY message_insert ON messages
  FOR INSERT WITH CHECK (
    department_id IN (
      SELECT department_id FROM department_members 
      WHERE user_id = auth.uid()
    ) AND sender_id = auth.uid()
  );

-- Similar policies for other tables (abbreviated)
CREATE POLICY reaction_access ON message_reactions
  FOR SELECT USING (message_id IN (
    SELECT id FROM messages WHERE department_id IN (
      SELECT department_id FROM department_members 
      WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY thread_access ON message_threads
  FOR SELECT USING (parent_message_id IN (
    SELECT id FROM messages WHERE department_id IN (
      SELECT department_id FROM department_members 
      WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY file_access ON files
  FOR SELECT USING (department_id IN (
    SELECT department_id FROM department_members 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY meeting_access ON meetings
  FOR SELECT USING (department_id IN (
    SELECT department_id FROM department_members 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY task_access ON tasks
  FOR SELECT USING (department_id IN (
    SELECT department_id FROM department_members 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY approval_access ON approvals
  FOR SELECT USING (
    department_id IN (
      SELECT department_id FROM department_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_dept_org ON departments(organization_id);
CREATE INDEX idx_dept_members_dept ON department_members(department_id);
CREATE INDEX idx_dept_members_user ON department_members(user_id);
CREATE INDEX idx_messages_dept ON messages(department_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_meeting_dept ON meetings(department_id);
CREATE INDEX idx_tasks_dept ON tasks(department_id);
CREATE INDEX idx_attendance_dept_date ON attendance(department_id, date);
CREATE INDEX idx_presence_user ON user_presence(user_id);
CREATE INDEX idx_whiteboard_meeting ON whiteboards(meeting_id);
