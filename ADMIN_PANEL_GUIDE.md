# Admin Panel Guide

## Overview

The admin panel allows administrators and moderators to manage car data directly through the website interface. Admins have a different UI with access to special features.

## Features

### 1. **Brand Management**
- Add new car brands (e.g., Toyota, BMW, Tesla)
- Specify the brand's country of origin
- Delete brands (will cascade delete all related models and trims)

### 2. **Model Management**
- Add new car models to existing brands
- Set production start and end years
- Delete models (will cascade delete all related trims)

### 3. **Trim Management**
- Add specific trim variants for models
- Specify year, trim name, engine, transmission, and drivetrain
- Delete trims (only if no reviews exist)

### 4. **Image Upload**
- Upload car photos directly to Supabase Storage
- Supports drag & drop and multiple file uploads
- Generates public URLs for use in the application
- Supports JPEG, PNG, and WebP formats (up to 10MB per file)

## Accessing the Admin Panel

### Step 1: Make Your User an Admin

Run the following SQL in Supabase SQL Editor:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);
```

Or use the provided helper script:

```bash
# Make yourself an admin
node scripts/make-admin.js your-email@example.com
```

### Step 2: Access the Admin Panel

1. Log in to your account
2. You'll see "Admin Panel" appear in the navigation menu (highlighted in primary color)
3. Click "Admin Panel" to access the interface

## User Roles

- **User**: Regular users (can post reviews)
- **Moderator**: Can manage car data but cannot delete
- **Admin**: Full access to all admin features including deletion

## Using the Admin Panel

### Adding a Brand

1. Navigate to the "Brands" tab
2. Fill in:
   - **Brand Name** (required): e.g., "Toyota"
   - **Country** (optional): e.g., "Japan"
3. Click "Add Brand"

### Adding a Model

1. Navigate to the "Models" tab
2. Select a brand from the dropdown
3. Fill in:
   - **Model Name** (required): e.g., "Corolla"
   - **Start Year** (optional): e.g., "2015"
   - **End Year** (optional): Leave empty if still in production
4. Click "Add Model"

### Adding a Trim

1. Navigate to the "Trims" tab
2. Select a model from the dropdown
3. Fill in:
   - **Year** (required): e.g., "2024"
   - **Trim Name** (optional): e.g., "Sport", "Limited"
   - **Engine** (optional): e.g., "2.0L Turbo"
   - **Transmission** (optional): e.g., "Automatic"
   - **Drivetrain** (optional): e.g., "FWD", "AWD"
4. Click "Add Trim"

### Uploading Car Images

1. Navigate to the "Upload Images" tab
2. Enter a car slug (e.g., "toyota-corolla-2024")
   - Use lowercase, hyphens between words
   - This becomes part of the filename
3. Drag and drop images or click to browse
4. Multiple images can be uploaded at once
5. Copy the public URLs for use in your application

**Image naming convention:**
- Format: `{carSlug}-{timestamp}.{extension}`
- Example: `toyota-corolla-2024-1729012345678.jpg`

## Storage Structure

Images are stored in Supabase Storage:
- Bucket: `review-images`
- Path: `cars/{filename}`

## API Endpoints

The admin panel uses these API endpoints:

```
GET    /api/admin/brands      - List all brands
POST   /api/admin/brands      - Create a brand
DELETE /api/admin/brands?id=X - Delete a brand

GET    /api/admin/models      - List all models
POST   /api/admin/models      - Create a model
DELETE /api/admin/models?id=X - Delete a model

GET    /api/admin/trims       - List all trims
POST   /api/admin/trims       - Create a trim
DELETE /api/admin/trims?id=X  - Delete a trim

POST   /api/admin/upload-image - Upload a car image
DELETE /api/admin/upload-image?path=X - Delete an image
```

## Security

- All admin routes are protected by middleware
- Only users with `admin` or `moderator` roles can access
- Authentication is checked on both frontend and backend
- Unauthenticated users are redirected to login
- Non-admin users are redirected to home page

## Permissions

| Action | User | Moderator | Admin |
|--------|------|-----------|-------|
| View admin panel | ❌ | ✅ | ✅ |
| Add brands/models/trims | ❌ | ✅ | ✅ |
| Upload images | ❌ | ✅ | ✅ |
| Delete brands/models | ❌ | ❌ | ✅ |
| Delete trims | ❌ | ❌ | ✅ |
| Delete images | ❌ | ❌ | ✅ |

## Tips

1. **Slugs**: Use consistent naming for car slugs
   - Good: `toyota-corolla-2024`, `bmw-3-series-2023`
   - Bad: `Toyota Corolla 2024`, `bmw_3series_2023`

2. **Images**: Upload high-quality images
   - Recommended: 1200x800px or higher
   - Format: JPEG for photos, PNG for graphics
   - Keep file sizes reasonable (< 2MB per image)

3. **Organization**: 
   - Add brands before models
   - Add models before trims
   - Use consistent naming conventions

4. **Deletion**:
   - Deleting a brand deletes all its models and trims
   - Deleting a model deletes all its trims
   - Trims with reviews cannot be deleted

## Troubleshooting

### "Forbidden - Admin access required"
- Your user role is not set to admin or moderator
- Run the SQL command to update your role

### "Cannot delete trim with existing reviews"
- The trim has reviews associated with it
- Reviews must be deleted first (not recommended)
- Consider archiving instead of deleting

### Image upload fails
- Check file size (max 10MB)
- Ensure file type is JPEG, PNG, or WebP
- Verify Supabase Storage is configured correctly
- Check that the `review-images` bucket exists

### Admin panel not visible
- Clear browser cache and cookies
- Log out and log back in
- Verify role in database: `SELECT role FROM profiles WHERE id = auth.uid();`

## Future Enhancements

Potential features for future versions:
- Bulk import from CSV
- Image gallery management
- Car specifications editor
- Analytics dashboard
- User management interface
- Review moderation tools

