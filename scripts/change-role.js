#!/usr/bin/env node

/**
 * Change User Role Script
 * 
 * This script changes a user's role in the database.
 * 
 * Usage:
 *   node scripts/change-role.js <email> <role>
 * 
 * Roles: admin, moderator, user
 * 
 * Examples:
 *   node scripts/change-role.js john@example.com admin
 *   node scripts/change-role.js jane@example.com moderator
 *   node scripts/change-role.js bob@example.com user
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const email = process.argv[2];
const role = process.argv[3];

const validRoles = ['admin', 'moderator', 'user'];

if (!email || !role) {
  console.error('❌ Error: Email and role are required');
  console.error('Usage: node scripts/change-role.js <email> <role>');
  console.error('Roles: admin, moderator, user');
  console.error('\nExamples:');
  console.error('  node scripts/change-role.js john@example.com admin');
  console.error('  node scripts/change-role.js jane@example.com moderator');
  console.error('  node scripts/change-role.js bob@example.com user');
  process.exit(1);
}

if (!validRoles.includes(role)) {
  console.error(`❌ Error: Invalid role "${role}"`);
  console.error('Valid roles: admin, moderator, user');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Error: Invalid email format');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function changeRole() {
  try {
    console.log(`🔍 Looking up user: ${email}`);
    
    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.error(`❌ User not found: ${email}`);
      console.log('\nAvailable users:');
      users.forEach(u => console.log(`  - ${u.email}`));
      process.exit(1);
    }
    
    console.log(`✓ Found user: ${user.email} (ID: ${user.id})`);
    
    // Get current role
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (currentProfile?.role === role) {
      console.log(`ℹ️  User already has role: ${role}`);
      console.log('No changes needed.');
      process.exit(0);
    }
    
    console.log(`📝 Changing role: ${currentProfile?.role || 'user'} → ${role}`);
    
    // Update profile role
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({ role: role })
      .eq('id', user.id)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    console.log(`✓ Updated role to: ${profile.role}`);
    console.log('\n✅ Success! User role has been changed.');
    
    if (role === 'admin' || role === 'moderator') {
      console.log('\nNext steps:');
      console.log('1. Have the user log out and log back in');
      console.log('2. They should now see "Admin Panel" in the navigation menu');
      console.log('3. They can access the admin panel at /admin');
    } else {
      console.log('\nNext steps:');
      console.log('1. Have the user log out and log back in');
      console.log('2. They will no longer see the Admin Panel');
    }
    
    console.log('\n📋 Role permissions:');
    if (role === 'admin') {
      console.log('  ✅ Can view admin panel');
      console.log('  ✅ Can add brands, models, trims');
      console.log('  ✅ Can upload images');
      console.log('  ✅ Can delete items');
    } else if (role === 'moderator') {
      console.log('  ✅ Can view admin panel');
      console.log('  ✅ Can add brands, models, trims');
      console.log('  ✅ Can upload images');
      console.log('  ❌ Cannot delete items');
    } else {
      console.log('  ❌ Cannot access admin panel');
      console.log('  ✅ Can post reviews');
      console.log('  ✅ Can use public features');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

changeRole();

