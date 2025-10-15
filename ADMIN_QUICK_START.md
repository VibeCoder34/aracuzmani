# Admin Panel Quick Start 🚀

## Setup (5 minutes)

### 1. Make Yourself Admin

Choose one method:

**Method A - Using Script (Recommended):**
```bash
node scripts/make-admin.js your-email@example.com
```

**Method B - Using Supabase SQL Editor:**
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

### 2. Log Out and Log Back In

This refreshes your session with the new admin role.

### 3. Access Admin Panel

You'll now see **"Admin Panel"** link in the navigation menu (in primary color).

---

## Adding Your First Car (2 minutes)

### Step 1: Add a Brand
1. Go to Admin Panel → **Brands** tab
2. Enter brand name: `BMW`
3. Enter country: `Germany`
4. Click **Add Brand**

### Step 2: Add a Model
1. Go to **Models** tab
2. Select brand: `BMW`
3. Enter model name: `3 Series`
4. Start year: `2019`
5. End year: (leave empty)
6. Click **Add Model**

### Step 3: Add a Trim
1. Go to **Trims** tab
2. Select model: `BMW 3 Series`
3. Enter:
   - Year: `2024`
   - Trim name: `M340i`
   - Engine: `3.0L Turbo I6`
   - Transmission: `8-Speed Automatic`
   - Drivetrain: `RWD`
4. Click **Add Trim**

### Step 4: Upload Images
1. Go to **Upload Images** tab
2. Enter slug: `bmw-3-series-2024`
3. Drag and drop 3-5 photos
4. Wait for upload to complete
5. **Copy the public URLs** - you'll need these!

---

## What You Get

### 🎯 Admin Features
- ✅ Full CRUD for brands, models, and trims
- ✅ Image upload with drag & drop
- ✅ Role-based permissions (admin vs moderator)
- ✅ Protected routes and API endpoints
- ✅ Beautiful, responsive UI

### 👀 Visual Differences for Admins
- **Navigation**: "Admin Panel" link in header (primary color)
- **Dropdown Menu**: Admin Panel option when clicking profile
- **Access**: Direct access to `/admin` route
- **Functionality**: Can delete items (moderators cannot)

---

## Quick Reference

### File Locations
```
Admin Page:    src/app/admin/page.tsx
API Routes:    src/app/api/admin/*/route.ts
Components:    src/components/admin/
Scripts:       scripts/make-admin.js
Guide:         ADMIN_PANEL_GUIDE.md
```

### URL Structure
```
Admin Panel:   http://localhost:3000/admin
Brands API:    http://localhost:3000/api/admin/brands
Models API:    http://localhost:3000/api/admin/models
Trims API:     http://localhost:3000/api/admin/trims
Upload API:    http://localhost:3000/api/admin/upload-image
```

### Permissions
```
Moderator: Can create, cannot delete
Admin:     Can create and delete
User:      Cannot access admin panel
```

---

## Useful Commands

### List All Users
```bash
node scripts/list-users.js
```

### Check User Role
```sql
SELECT email, role FROM profiles 
JOIN auth.users ON profiles.id = auth.users.id;
```

### Make User Moderator
```sql
UPDATE profiles SET role = 'moderator' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

### Demote to Regular User
```sql
UPDATE profiles SET role = 'user' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

---

## Troubleshooting

### "Forbidden - Admin access required"
→ Your role is not set correctly. Run the make-admin script again.

### Admin Panel link not showing
→ Log out completely and log back in to refresh your session.

### Can't delete a trim
→ Check if it has reviews. Trims with reviews cannot be deleted.

### Image upload fails
→ Check that your Supabase Storage bucket "review-images" exists and is public.

---

## Next Steps

1. ✅ Add more brands and models
2. ✅ Upload car images
3. ✅ Test creating reviews for the new cars
4. ✅ Explore the admin features
5. 📖 Read the full guide: `ADMIN_PANEL_GUIDE.md`

---

## Tips

💡 **Use consistent slugs**: `brand-model-year` format  
💡 **Upload quality images**: 1200x800px or higher  
💡 **Organize first**: Add brands → models → trims → images  
💡 **Test with moderator**: Create a test moderator account to verify permissions  

---

## Support

Having issues? Check these files:
- 📖 **Full Guide**: `ADMIN_PANEL_GUIDE.md`
- 📝 **Implementation Details**: `ADMIN_IMPLEMENTATION_SUMMARY.md`
- 🛠️ **Scripts Help**: `scripts/README.md`

---

**That's it! You're ready to manage your car database through the admin panel! 🎉**

