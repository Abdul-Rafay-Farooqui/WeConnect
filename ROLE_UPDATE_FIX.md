# Role Update Permission Fix

## Problem
After updating a user's role (e.g., promoting someone to admin or lead), the user couldn't immediately perform actions allowed by their new role. They had to refresh the page or re-login for the permissions to take effect.

## Root Cause
The permission checks (`isOrgAdmin` and `isTeamAdmin`) were based on static fields like `created_by`, `owner_id`, etc., which don't change when roles are updated. The actual role information from the membership tables wasn't being used for permission checks.

## Solution

### Backend Changes (WeConnectBackend)

#### 1. Enhanced Organization Response
**File**: `src/modules/organizations/organizations.service.ts`

Added `current_user_role` to team summaries in the organization response:

```typescript
// Before: Teams didn't include current user's role
const teams = [];
for (const team of rawTeams) {
  teams.push(await this.mapTeamSummary(team));
}

// After: Teams include current user's role
const teams = [];
for (const team of rawTeams) {
  const teamSummary = await this.mapTeamSummary(team);
  const teamMembership = await this.teamMembers.findOne({
    where: { team_id: team.id, user_id: userId },
  });
  teams.push({
    ...teamSummary,
    current_user_role: teamMembership?.role || null,
  });
}
```

### Frontend Changes (weconnect)

#### 1. Updated Permission Checks
**File**: `src/components/organization/OrgView.tsx`

**Organization Admin Check**:
```typescript
// Now checks current_user_role from membership
const isOrgAdmin = (() => {
  if (!uid || !selectedOrgObj) return false;
  const o = selectedOrgObj as any;
  
  // Primary check: current_user_role from membership
  if (o.current_user_role) {
    return ['owner', 'admin', 'manager'].includes(o.current_user_role);
  }
  
  // Fallback to creator fields
  // ...
})();
```

**Team Admin Check**:
```typescript
// Now checks current_user_role from team membership
const isTeamAdmin = (() => {
  if (!uid || !selectedTeam) return false;
  const t = selectedTeam as any;
  
  // Primary check: current_user_role from team membership
  if (t.current_user_role === 'lead') return true;
  
  // Also check team workspace members data
  const currentMember = teamData?.members?.find((m: any) => m.id === uid);
  if (currentMember?.role === 'lead') return true;
  
  // Fallback to org admin (org admins can manage all teams)
  return isOrgAdmin;
})();
```

#### 2. Data Refresh After Role Updates
**Files**: 
- `src/components/organization/OrgView.tsx`

Both role update handlers now reload the organization/team data:

```typescript
// Organization role update
const handleUpdateOrgMemberRole = async (userId: string, newRole: string) => {
  if (!selectedOrg) throw new Error("No organization selected");
  setError("");
  await OrganizationAPI.updateOrgMemberRole(selectedOrg, userId, newRole);
  await loadOrganizationTeams(selectedOrg, true); // Reloads org data with new roles
};

// Team role update
const handleUpdateTeamMemberRole = async (memberId: string, newRole: string) => {
  if (!selectedOrg || !selectedTeam?.id) throw new Error("No team selected");
  setError("");
  await OrganizationAPI.updateTeamMemberRole(selectedOrg, selectedTeam.id, memberId, newRole);
  await loadTeamWorkspace(selectedOrg, selectedTeam.id); // Reloads team data with new roles
};
```

## How It Works Now

1. **User A promotes User B to admin**
2. **Backend updates** the role in `organization_members` table
3. **Frontend calls** `loadOrganizationTeams()` to refresh data
4. **Backend returns** organization with `current_user_role: 'admin'` for User B
5. **Frontend recalculates** `isOrgAdmin` using the new `current_user_role`
6. **User B immediately sees** admin UI elements (add members, delete team buttons, role selectors, etc.)
7. **User B can immediately perform** admin actions without page refresh

## Benefits

✅ **Immediate permission updates** - No page refresh needed
✅ **Accurate permission checks** - Based on actual membership roles
✅ **Consistent behavior** - Works for both org and team roles
✅ **Better UX** - Users can use their new permissions right away
✅ **Secure** - Backend still enforces all permissions

## Testing Checklist

- [ ] Promote a member to admin → Can immediately add members
- [ ] Promote a member to team lead → Can immediately update other members' roles
- [ ] Demote an admin to member → Immediately loses admin UI elements
- [ ] Demote a team lead to member → Immediately loses lead permissions
- [ ] Org admin can manage all teams regardless of team role
- [ ] Owner role cannot be changed by non-owners
- [ ] Users cannot change their own roles
