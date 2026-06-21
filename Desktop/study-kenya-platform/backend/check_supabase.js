/**
 * check_supabase.js
 * Run with: npm run check-db
 * Verifies connectivity to Supabase and confirms required tables exist.
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const REQUIRED_TABLES = ['admins', 'universities', 'blog_posts', 'inquiries'];

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

async function checkTable(table) {
  const { error } = await supabase.from(table).select('id').limit(1);
  if (error) {
    return { table, ok: false, message: error.message };
  }
  return { table, ok: true, message: 'OK' };
}

async function main() {
  console.log('\n🔍  StudyKenya — Supabase Connection Check\n');

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_URL.startsWith('https')) {
    console.error('❌  SUPABASE_URL is missing or invalid in your .env file.');
    process.exit(1);
  }

  const keyName = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY' : 'SUPABASE_KEY';
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_KEY) {
    console.error('❌  Neither SUPABASE_SERVICE_ROLE_KEY nor SUPABASE_KEY is set in your .env file.');
    process.exit(1);
  }

  console.log(`✅  Using key: ${keyName}`);
  console.log(`✅  Project URL: ${process.env.SUPABASE_URL}\n`);

  let allPassed = true;

  for (const table of REQUIRED_TABLES) {
    const result = await checkTable(table);
    if (result.ok) {
      console.log(`   ✅  Table "${table}" — reachable`);
    } else {
      console.log(`   ❌  Table "${table}" — ${result.message}`);
      allPassed = false;
    }
  }

  console.log('\n' + (allPassed
    ? '🎉  All checks passed! Your Supabase instance is ready.'
    : '⚠️   Some checks failed. Run supabase_setup.sql in the Supabase SQL Editor first.'));

  process.exit(allPassed ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
