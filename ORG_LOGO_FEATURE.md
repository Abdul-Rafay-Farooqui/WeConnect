# Organization Logo/Avatar Feature

## Overview
Added the ability to upload and display organization logos/avatars when creating organizations. The logo appears in the organization sidebar next to the organization name.

## Features

### 1. Logo Upload in Create Organization Modal
- **File Selection**: Users can choose an image file (PNG, JPG, etc.)
- **Preview**: Shows a preview of the selected logo before creating the organization
- **Validation**: 
  - Only image files are accepted
  - Maximum file size: 5MB
  - Clear error messages for invalid files
- **Remove Option**: Users can remove the selected logo before submission
- **Optional**: Logo upload is optional - organizations can still use the default emoji icon

### 2. Logo Display in Sidebar
- **Logo Display**: If an organization has a logo, it displays as a rounded image (32x32px)
- **Fallback**: If no logo is uploaded, shows the default emoji icon (🏢)
- **Consistent Sizing**: All logos are displayed at the same size for visual consistency

## Implementation Details

### Frontend Changes

#### 1. CreateOrgModal Component
**File**: `src/components/organization/OrgModals.tsx`

**Added Features**:
- File input for image selection
- Image preview with remove button
- Base64 encoding for image data (temporary solution)
- File validation (type and size)
- Logo URL passed to submit handler

**UI Elements**:
```typescript
- Logo preview area (80x80px)
- "Choose Image" button
- Remove button (X) on preview
- File size/type hint text
```

#### 2. OrganizationSidebar Component
**File**: `src/components/organization/OrganizationSidebar.tsx`

**Updated Display Logic**:
```typescript
{org.logo_url ? (
  <img 
    src={org.logo_url} 
    alt={org.name} 
    className="w-8 h-8 rounded-lg object-cover"
  />
) : (
  <span className="text-xl">{org.icon || '🏢'}</span>
)}
```

#### 3. OrgView Component
**File**: `src/components/organization/OrgView.tsx`

**Updated Handler**:
```typescript
const handleCreateOrganization = async (
  name: string, 
  slug: string, 
  description: string, 
  logoUrl?: string
) => {
  // Passes logo_url to API
}
```

#### 4. API Client
**File**: `lib/api/organization.ts`

**Updated Type**:
```typescript
createOrganization: (payload: { 
  name: string; 
  slug?: string; 
  description?: string; 
  logo_url?: string 
}) => api.post("/organizations", payload)
```

### Backend Support

The backend already supports the `logo_url` field:

**Entity**: `Organization` (WeConnectBackend/src/entities/organization.entities.ts)
```typescript
@Column({ type: "text", nullable: true })
logo_url: string | null;
```

**Service**: `OrganizationsService`
- Accepts `logo_url` in create DTO
- Stores in database
- Returns in organization responses

## User Flow

### Creating Organization with Logo

1. **Click "New Org"** button in sidebar
2. **Modal Opens** with organization creation form
3. **Upload Logo** (optional):
   - Click "Choose Image" button
   - Select image file from device
   - Preview appears with remove option
4. **Fill Details**:
   - Organization name (required)
   - Slug (auto-generated)
   - Description (optional)
5. **Submit**: Click "Create Organization"
6. **Result**: Organization appears in sidebar with logo

### Viewing Organizations

- Organizations with logos show the uploaded image
- Organizations without logos show the default 🏢 emoji
- Logos are displayed consistently at 32x32px in the sidebar
- Logos are rounded for a modern look

## Technical Notes

### Current Implementation
- **Storage**: Currently using base64 encoding (embedded in database)
- **Size Limit**: 5MB per image
- **Format**: Any image format supported by browsers

### Production Considerations

For production deployment, consider:

1. **Cloud Storage**: Upload images to AWS S3, Cloudflare R2, or similar
2. **Image Optimization**: 
   - Resize images to optimal dimensions (e.g., 256x256px)
   - Compress images to reduce file size
   - Generate multiple sizes for different use cases
3. **CDN**: Serve images through a CDN for better performance
4. **Security**: 
   - Scan uploaded images for malware
   - Validate image content (not just extension)
   - Implement rate limiting on uploads

### Future Enhancements

Potential improvements:
- [ ] Edit organization logo after creation
- [ ] Crop/resize tool in the upload modal
- [ ] Support for animated logos (GIF, WebP)
- [ ] Logo templates/icon library
- [ ] Drag-and-drop upload
- [ ] Multiple logo variants (light/dark mode)
- [ ] Logo usage in other parts of the app (headers, emails, etc.)

## Example Usage

### With Logo
```
┌─────────────────────────────┐
│ [LOGO] Acme Corporation     │ ← Logo image displayed
│        3 teams              │
└─────────────────────────────┘
```

### Without Logo
```
┌─────────────────────────────┐
│ 🏢 Tech Startup Inc.        │ ← Default emoji icon
│    1 team                   │
└─────────────────────────────┘
```

## Testing Checklist

- [ ] Upload PNG image - displays correctly
- [ ] Upload JPG image - displays correctly
- [ ] Try to upload non-image file - shows error
- [ ] Try to upload >5MB file - shows error
- [ ] Remove logo before submission - works
- [ ] Create org without logo - uses default icon
- [ ] Create org with logo - logo appears in sidebar
- [ ] Logo maintains aspect ratio
- [ ] Multiple orgs with different logos display correctly
