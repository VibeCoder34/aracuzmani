#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Make Admin Script
 * 
 * This script updates a user's role to 'admin' in the database.
 * 
 * Usage:
 *   node scripts/make-admin.js <email>
 * 
 * Example:
 *   node scripts/make-admin.js john@example.com
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

if (!email) {
  console.error('❌ Error: Email address is required');
  console.error('Usage: node scripts/make-admin.js <email>');
  console.error('Example: node scripts/make-admin.js john@example.com');
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

async function makeAdmin() {
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
    
    // Update profile role
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user.id)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    console.log(`✓ Updated role to: ${profile.role}`);
    console.log('\n✅ Success! User is now an admin.');
    console.log('\nNext steps:');
    console.log('1. Have the user log out and log back in');
    console.log('2. They should now see "Admin Panel" in the navigation menu');
    console.log('3. They can access the admin panel at /admin');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

makeAdmin();

