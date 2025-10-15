#!/usr/bin/env node

/**
 * List Users Script
 * 
 * This script lists all users and their roles in the database.
 * 
 * Usage:
 *   node scripts/list-users.js
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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function listUsers() {
  try {
    console.log('🔍 Fetching users...\n');
    
    // Get all users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }
    
    if (users.length === 0) {
      console.log('No users found.');
      return;
    }
    
    // Get profiles with roles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, role');
    
    if (profileError) {
      throw profileError;
    }
    
    // Create a map of user id to profile
    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.id] = p;
    });
    
    console.log(`Found ${users.length} user(s):\n`);
    console.log('┌────────────────────────────────────────┬───────────────────────────┬──────────────┐');
    console.log('│ Email                                  │ Username                  │ Role         │');
    console.log('├────────────────────────────────────────┼───────────────────────────┼──────────────┤');
    
    users.forEach(user => {
      const profile = profileMap[user.id];
      const email = user.email || 'N/A';
      const username = profile?.username || 'N/A';
      const role = profile?.role || 'N/A';
      
      console.log(
        `│ ${email.padEnd(38)} │ ${username.padEnd(25)} │ ${role.padEnd(12)} │`
      );
    });
    
    console.log('└────────────────────────────────────────┴───────────────────────────┴──────────────┘');
    
    // Summary
    const roleCounts = {
      admin: 0,
      moderator: 0,
      user: 0
    };
    
    profiles.forEach(p => {
      if (roleCounts[p.role] !== undefined) {
        roleCounts[p.role]++;
      }
    });
    
    console.log('\n📊 Summary:');
    console.log(`  Total users: ${users.length}`);
    console.log(`  Admins: ${roleCounts.admin}`);
    console.log(`  Moderators: ${roleCounts.moderator}`);
    console.log(`  Regular users: ${roleCounts.user}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listUsers();

