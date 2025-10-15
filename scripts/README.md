# Admin Scripts

Helper scripts for managing admin users and database operations.

## Prerequisites

Make sure you have the following in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Scripts

### 1. Make Admin (`make-admin.js`)

Promotes a user to admin role.

**Usage:**
```bash
node scripts/make-admin.js <email>
```

**Example:**
```bash
node scripts/make-admin.js john@example.com
```

**What it does:**
- Finds the user by email
- Updates their role to 'admin' in the profiles table
- Shows confirmation message

### 2. List Users (`list-users.js`)

Lists all users and their roles in a formatted table.

**Usage:**
```bash
node scripts/list-users.js
```

**Output:**
```
┌────────────────────────────────────────┬───────────────────────────┬──────────────┐
│ Email                                  │ Username                  │ Role         │
├────────────────────────────────────────┼───────────────────────────┼──────────────┤
│ john@example.com                       │ johndoe                   │ admin        │
│ jane@example.com                       │ janedoe                   │ user         │
└────────────────────────────────────────┴───────────────────────────┴──────────────┘

📊 Summary:
  Total users: 2
  Admins: 1
  Moderators: 0
  Regular users: 1
```

## SQL Alternative

You can also make a user admin directly via SQL in Supabase SQL Editor:

```sql
-- Make user admin
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);

-- Make user moderator
UPDATE public.profiles
SET role = 'moderator'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);

-- Demote to regular user
UPDATE public.profiles
SET role = 'user'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);
```

## Troubleshooting

### "Missing Supabase credentials"
- Check that `.env.local` exists in the project root
- Verify the environment variables are correctly set
- Make sure there are no typos in the variable names

### "User not found"
- Verify the email address is correct
- Check that the user has signed up
- Run `list-users.js` to see all available users

### Script won't run
- Make sure Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check file permissions: `ls -la scripts/`

