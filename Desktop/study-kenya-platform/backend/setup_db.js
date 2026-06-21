/**
 * setup_db.js — Run once to create tables and seed the admin user.
 * This script uses direct Supabase REST API calls.
 * Run: node setup_db.js
 */
require('dotenv').config();
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

function supabaseRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('\n🔧  StudyKenya — Database Setup\n');
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log(`   Key: ${SUPABASE_KEY ? SUPABASE_KEY.substring(0, 20) + '...' : 'MISSING'}\n`);

  // Test connectivity
  const ping = await supabaseRequest('GET', '/rest/v1/admins?select=id&limit=1');
  
  if (ping.status === 404 || (ping.body && ping.body.message && ping.body.message.includes('relation'))) {
    console.log('❌  Tables do not exist yet. Please run supabase_setup.sql first:\n');
    console.log('   1. Go to: https://supabase.com/dashboard/project/ydiwlcqvlwvfvmhubfrh/sql');
    console.log('   2. Open the SQL Editor');
    console.log('   3. Paste and run: backend/supabase_setup.sql\n');
    return;
  }

  if (ping.status === 401 || ping.status === 403) {
    console.log('⚠️   Access restricted (RLS is enabled — this is expected with anon key).');
    console.log('   Tables may still exist. Try logging in with admin credentials.\n');
    console.log('   Default credentials:');
    console.log('   📧 Email:    admin@studykenya.com');
    console.log('   🔑 Password: password123\n');
    return;
  }

  if (ping.status === 200) {
    const admins = Array.isArray(ping.body) ? ping.body : [];
    if (admins.length === 0) {
      console.log('📭  No admin found — inserting default admin...');
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('password123', 10);
      const insert = await supabaseRequest('POST', '/rest/v1/admins', {
        email: 'admin@studykenya.com',
        password: hash
      });
      if (insert.status === 201) {
        console.log('✅  Admin created: admin@studykenya.com / password123');
      } else {
        console.log('❌  Failed to insert admin:', JSON.stringify(insert.body));
      }
    } else {
      console.log(`✅  Admin table accessible — ${admins.length} admin(s) found.`);
      console.log('   You can login with: admin@studykenya.com / password123');
    }
  } else {
    console.log(`⚠️   Unexpected response: ${ping.status}`, ping.body);
  }

  console.log('\n✅  Setup check complete!\n');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
