# Organization and Team Edit Feature

## Overview
Added the ability to edit/update organizations and teams, restricted to admins/owners for organizations and admins/leads for teams.

## Features

### 1. Edit Organization
**Permissions**: Only organization owners, admins, and managers can edit

**Editable Fields**:
- Organization name
- Slug (URL identifier)
- Description
- Logo/avatar image
- Website URL

**Access**: Edit button (✏️) appears on hover in the sidebar next to selected organization

### 2. Edit Team
**Permissions**: Only organization admins/managers and team leads can edit

**Editable Fields**:
- Team name
- Description
- Visibility (Organization-wide or Private)

**Access**: Edit button (✏️) appears on hover in the sidebar next to team name

## User Interface

### Organization Sidebar Updates

**Organization Row** (when selected and user is admin):
```
┌─────────────────────────────────────┐
│ [LOGO] Acme Corp          ✏️ 🗑️  │ ← Edit and Delete buttons on hover
│        3 teams                      │
└─────────────────────────────────────┘
```

**Team Row** (when user is team lead or org admin):
```
┌─────────────────────────────────────┐
│   👥 Engineering Team    ✏️ ➕     │ ← Edit and Add members buttons
└─────────────────────────────────────┘
```

### Edit Organization Modal

**Features**:
- Pre-filled with current organization data
- Logo upload/change with preview
- All fields from create modal plus website URL
- Validation for required fields
- Save Changes button

**Fields**:
1. **Logo**: Change or remove organization logo
2. **Name** (required): Organization name
3. **Slug**: URL-friendly identifier
4. **Website URL**: Organization website
5. **Description**: What the organization does

### Edit Team Modal

**Features**:
- Pre-filled with current team data
- Visibility selector (radio buttons)
- Clean, focused interface

**Fields**:
1. **Name** (required): Team name
2. **Description**: Team purpose/description
3. **Visibility**:
   - **Organization**: All org members can see
   - **Private**: Only team members can see

## Implementation Details

### Frontend Components

#### 1. EditOrgModal
**File**: `src/components/organization/OrgModals.tsx`

**Features**:
- Loads existing organization data on open
- Logo upload with preview and remove option
- Form validation
- Error handling

#### 2. EditTeamModal
**File**: `src/components/organization/OrgModals.tsx`

**Features**:
- Loads existing team data on open
- Radio button visibility selector
- Form validation
- Error handling

#### 3. OrganizationSidebar
**File**: `src/components/organization/OrganizationSidebar.tsx`

**Updates**:
- Added edit button for organizations (admin only)
- Added edit button for teams (lead/admin only)
- Buttons appear on hover
- Proper permission checks

#### 4. OrgView
**File**: `src/components/organization/OrgView.tsx`

**New Handlers**:
```typescript
handleUpdateOrganization(data: {
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
  website_url?: string;
})

handleUpdateTeam(data: {
  name: string;
  description: string;
  visibility: 'organization' | 'private';
})
```

**New State**:
- `showEditOrg`: Controls edit organization modal
- `showEditTeam`: Controls edit team modal

### API Integration

#### Organization Update
**Endpoint**: `PATCH /organizations/:id`

**Payload**:
```typescript
{
  name?: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
}
```

#### Team Update
**Endpoint**: `PATCH /organizations/:id/teams/:teamId`

**Payload**:
```typescript
{
  name?: string;
  description?: string;
  visibility?: 'organization' | 'private';
}
```

### Backend Support

The backend already has full support for updates:

**Service Methods**:
- `update(userId, organizationId, dto)` - Updates organization
- `updateTeam(userId, organizationId, teamId, dto)` - Updates team

**Authorization**:
- Organization updates: Requires org manager (owner/admin/manager)
- Team updates: Requires org manager OR team lead

## User Flow

### Editing an Organization

1. **Select Organization** in sidebar
2. **Hover over organization** row
3. **Click edit button** (✏️)
4. **Modal opens** with current data pre-filled
5. **Make changes**:
   - Update name, slug, description
   - Change logo
   - Add/update website URL
6. **Click "Save Changes"**
7. **Organization updates** immediately
8. **Sidebar refreshes** with new data

### Editing a Team

1. **Select Team** in sidebar
2. **Hover over team** row
3. **Click edit button** (✏️)
4. **Modal opens** with current data pre-filled
5. **Make changes**:
   - Update name, description
   - Change visibility setting
6. **Click "Save Changes"**
7. **Team updates** immediately
8. **Sidebar and workspace refresh** with new data

## Permission Matrix

### Organization Edit Permissions

| Role    | Can Edit Org | Can Edit Teams |
|---------|--------------|----------------|
| Owner   | ✅ Yes       | ✅ Yes         |
| Admin   | ✅ Yes       | ✅ Yes         |
| Manager | ✅ Yes       | ✅ Yes         |
| Member  | ❌ No        | ❌ No          |
| Guest   | ❌ No        | ❌ No          |

### Team Edit Permissions

| Role                  | Can Edit Team |
|-----------------------|---------------|
| Organization Owner    | ✅ Yes        |
| Organization Admin    | ✅ Yes        |
| Organization Manager  | ✅ Yes        |
| Team Lead             | ✅ Yes        |
| Team Member           | ❌ No         |
| Team Guest            | ❌ No         |

## Security Features

1. **Permission Checks**: Edit buttons only visible to authorized users
2. **Backend Validation**: Server validates permissions before allowing updates
3. **Role-Based Access**: Different permissions for org vs team edits
4. **Audit Trail**: Backend tracks who made changes (via updated_at)

## UI/UX Enhancements

1. **Hover-to-Reveal**: Edit buttons appear on hover to reduce clutter
2. **Pre-filled Forms**: Current data loaded automatically
3. **Visual Feedback**: Loading states during save
4. **Error Messages**: Clear error messages for validation failures
5. **Consistent Design**: Matches existing modal patterns

## Future Enhancements

Potential improvements:
- [ ] Edit history/audit log
- [ ] Bulk edit multiple teams
- [ ] Advanced permissions (custom roles)
- [ ] Team templates
- [ ] Organization settings page (instead of modal)
- [ ] Undo/redo functionality
- [ ] Real-time collaboration (see who's editing)

## Testing Checklist

### Organization Edit
- [ ] Admin can open edit modal
- [ ] Non-admin cannot see edit button
- [ ] Form pre-fills with current data
- [ ] Can update name successfully
- [ ] Can update logo successfully
- [ ] Can update description successfully
- [ ] Can update website URL successfully
- [ ] Validation works for required fields
- [ ] Changes reflect immediately in sidebar
- [ ] Error handling works

### Team Edit
- [ ] Team lead can open edit modal
- [ ] Org admin can open edit modal
- [ ] Non-lead/non-admin cannot see edit button
- [ ] Form pre-fills with current data
- [ ] Can update name successfully
- [ ] Can update description successfully
- [ ] Can change visibility successfully
- [ ] Validation works for required fields
- [ ] Changes reflect immediately in sidebar
- [ ] Error handling works
