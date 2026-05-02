# Role Management Feature

## Overview
This feature allows organization admins and team leads to update member roles at both organization and team levels. Role changes take effect immediately, and the user's permissions are updated in real-time.

## Organization-Level Roles

### Available Roles
- **Owner**: Full control over the organization (cannot be changed by others)
- **Admin**: Can manage members, teams, and settings
- **Manager**: Can manage teams and members
- **Member**: Regular member with standard access
- **Guest**: Limited access member

### Permissions
- Only **admins**, **managers**, and **owners** can update member roles
- **Owner** role cannot be changed (protected)
- Members cannot change their own roles
- Role changes are restricted based on the current user's permissions
- After a role update, permissions are immediately refreshed

## Team-Level Roles

### Available Roles
- **Lead**: Team leader with full team management permissions
- **Member**: Regular team member
- **Guest**: Limited access team member

### Permissions
- Only **team leads** and **organization admins/managers** can update team member roles
- When a new lead is assigned, the previous lead is automatically demoted to member
- Members cannot change their own roles
- After a role update, permissions are immediately refreshed

## How to Use

### Organization Level
1. Navigate to the organization members view
2. Click on a member's role badge (if you have admin permissions)
3. Select the new role from the dropdown
4. The role will be updated immediately
5. The user's permissions will be refreshed automatically

### Team Level
1. Select a team from the sidebar
2. Go to the "Members" tab
3. Click on a member's role badge (if you have lead/admin permissions)
4. Select the new role from the dropdown
5. The role will be updated immediately
6. The user's permissions will be refreshed automatically

## Real-Time Permission Updates

When a user's role is updated:
- The organization/team data is automatically reloaded
- The user's `current_user_role` is updated in the backend response
- Permission checks (`isOrgAdmin`, `isTeamAdmin`) are recalculated
- UI elements (buttons, dropdowns) are updated to reflect new permissions
- The user can immediately perform actions allowed by their new role

## Technical Implementation

### Frontend Components
- `RoleSelector.tsx`: Reusable dropdown component for role selection
- `MembersTab.tsx`: Team members display with role management
- `OrganizationMembersView.tsx`: Organization members display with role management

### API Endpoints
- `PATCH /organizations/:id/members/:memberId` - Update organization member role
- `PATCH /organizations/:id/teams/:teamId/members/:memberId` - Update team member role

### Backend Authorization
- Organization role updates require admin/manager/owner permissions
- Team role updates require team lead or organization admin/manager permissions
- Owner role promotion is restricted to current owners only
- Backend includes `current_user_role` in organization and team responses for accurate permission checks

### Permission Checks
- `isOrgAdmin`: Checks if user has 'owner', 'admin', or 'manager' role in organization
- `isTeamAdmin`: Checks if user has 'lead' role in team OR is an organization admin/manager
- Both checks use the `current_user_role` field from backend responses
- Permissions are recalculated after every role update
