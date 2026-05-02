# Search Workspace Removal

## Overview
Removed the search workspace functionality from the organization module to simplify the interface.

## Changes Made

### 1. Removed Components
**File Deleted**: `src/components/organization/WorkspaceCommandBar.tsx`
- This component contained the search input and presence status display
- Was displayed at the top of team workspaces

### 2. Updated OrgView Component
**File**: `src/components/organization/OrgView.tsx`

**Removed**:
- Import of `WorkspaceCommandBar`
- `commandBarQuery` state variable
- `setCommandBarQuery` state setter
- `presence` prop
- `presenceOptions` prop
- Rendering of `<WorkspaceCommandBar />` component

**Before**:
```typescript
const OrgView = ({ 
  presence = "available", 
  presenceOptions = [] as any[],
  onOrgChange,
}: {
  presence?: string;
  presenceOptions?: any[];
  onOrgChange?: (orgId: string | null) => void;
}) => {
  // ...
  const [commandBarQuery, setCommandBarQuery] = useState("");
  // ...
  <WorkspaceCommandBar
    presence={presence}
    presenceOptions={presenceOptions}
    commandBarQuery={commandBarQuery}
    setCommandBarQuery={setCommandBarQuery}
  />
}
```

**After**:
```typescript
const OrgView = ({ 
  onOrgChange,
}: {
  onOrgChange?: (orgId: string | null) => void;
}) => {
  // commandBarQuery state removed
  // WorkspaceCommandBar component removed
}
```

### 3. Updated Organization Page
**File**: `src/app/(main)/organization/page.tsx`

**Removed**:
- `PRESENCE_OPTIONS` constant
- `presence` state variable
- `currentPresenceOption` computed value
- Props passed to `<OrgView />`

**Before**:
```typescript
const PRESENCE_OPTIONS = [
  { id: 'available', label: 'Available', icon: '🟢' },
  // ...
];

export default function OrganizationPage() {
  const [presence, setPresence] = useState('available');
  // ...
  return <OrgView presence={presence} presenceOptions={PRESENCE_OPTIONS} />;
}
```

**After**:
```typescript
export default function OrganizationPage() {
  return <OrgView />;
}
```

## What Was Removed

### Search Workspace Feature
- **Search Input**: Text field with placeholder "Search workspace..."
- **Functionality**: Would have allowed searching within team workspace content
- **Location**: Displayed between the sidebar and team workspace header

### Presence Status Display
- **Status Indicator**: Visual indicator showing user's availability status
- **Options**: Available (🟢), Busy (🔴), Do not disturb (🔕), Be right back (🟡), Away (⚪)
- **Location**: Displayed alongside the search input in the command bar

## Impact

✅ **Simplified UI**: Removed an unused search feature that cluttered the interface
✅ **Cleaner Code**: Removed unnecessary state management and props
✅ **Better Focus**: Users can focus on team collaboration without distraction
✅ **No Breaking Changes**: The removal doesn't affect any other functionality

## Notes

- The search functionality in the chat module (ChatSearchBar) remains intact
- User search in modals (for adding members) is still available
- This only removed the workspace-level search that wasn't being used
