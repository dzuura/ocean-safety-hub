/**
 * Script untuk mengelola admin role dari command line
 * 
 * Penggunaan:
 * node scripts/manage-admin.js set-admin user@example.com
 * node scripts/manage-admin.js revoke-admin user@example.com
 * node scripts/manage-admin.js list-admins
 * node scripts/manage-admin.js check-admin user@example.com
 */

require('dotenv').config();
const adminManager = require('../src/utils/adminManager');

const commands = {
  'set-admin': setAdmin,
  'revoke-admin': revokeAdmin,
  'list-admins': listAdmins,
  'check-admin': checkAdmin,
  'help': showHelp
};

async function setAdmin(email) {
  if (!email) {
    console.error('❌ Email diperlukan');
    console.log('Usage: node scripts/manage-admin.js set-admin user@example.com');
    process.exit(1);
  }

  try {
    console.log(`🔄 Setting admin role untuk: ${email}`);
    await adminManager.setAdminByEmail(email, true);
    console.log(`✅ ${email} berhasil dijadikan admin`);
  } catch (error) {
    console.error(`❌ Gagal set admin: ${error.message}`);
    process.exit(1);
  }
}

async function revokeAdmin(email) {
  if (!email) {
    console.error('❌ Email diperlukan');
    console.log('Usage: node scripts/manage-admin.js revoke-admin user@example.com');
    process.exit(1);
  }

  try {
    console.log(`🔄 Revoking admin role untuk: ${email}`);
    await adminManager.revokeAdminByEmail(email);
    console.log(`✅ Admin role berhasil dicabut dari ${email}`);
  } catch (error) {
    console.error(`❌ Gagal revoke admin: ${error.message}`);
    process.exit(1);
  }
}

async function listAdmins() {
  try {
    console.log('🔄 Mengambil daftar admin...');
    const admins = await adminManager.listAdmins();
    
    if (admins.length === 0) {
      console.log('📝 Tidak ada admin yang ditemukan');
      return;
    }

    console.log(`\n👥 Daftar Admin (${admins.length} user):`);
    console.log('═'.repeat(80));
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email}`);
      console.log(`   UID: ${admin.uid}`);
      console.log(`   Name: ${admin.displayName || 'N/A'}`);
      console.log(`   Email Verified: ${admin.emailVerified ? '✅' : '❌'}`);
      console.log(`   Role: ${admin.role}`);
      console.log('─'.repeat(80));
    });
  } catch (error) {
    console.error(`❌ Gagal mengambil daftar admin: ${error.message}`);
    process.exit(1);
  }
}

async function checkAdmin(email) {
  if (!email) {
    console.error('❌ Email diperlukan');
    console.log('Usage: node scripts/manage-admin.js check-admin user@example.com');
    process.exit(1);
  }

  try {
    console.log(`🔄 Checking admin status untuk: ${email}`);
    
    // Get user by email first
    const { getAuthAdmin } = require('../src/config/firebase');
    const authAdmin = getAuthAdmin();
    const userRecord = await authAdmin.getUserByEmail(email);
    
    const userWithClaims = await adminManager.getUserWithClaims(userRecord.uid);
    
    console.log('\n📋 User Information:');
    console.log('═'.repeat(50));
    console.log(`Email: ${userWithClaims.email}`);
    console.log(`UID: ${userWithClaims.uid}`);
    console.log(`Name: ${userWithClaims.displayName || 'N/A'}`);
    console.log(`Email Verified: ${userWithClaims.emailVerified ? '✅' : '❌'}`);
    console.log(`Is Admin: ${userWithClaims.isAdmin ? '✅ YES' : '❌ NO'}`);
    console.log(`Role: ${userWithClaims.role}`);
    
    if (Object.keys(userWithClaims.customClaims).length > 0) {
      console.log('\n🏷️  Custom Claims:');
      console.log(JSON.stringify(userWithClaims.customClaims, null, 2));
    }
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ User dengan email ${email} tidak ditemukan`);
    } else {
      console.error(`❌ Gagal check admin status: ${error.message}`);
    }
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🛠️  Admin Management CLI

Available Commands:
  set-admin <email>     - Set user sebagai admin
  revoke-admin <email>  - Revoke admin role dari user
  list-admins          - List semua admin users
  check-admin <email>   - Check admin status user
  help                 - Show this help message

Examples:
  node scripts/manage-admin.js set-admin admin@example.com
  node scripts/manage-admin.js revoke-admin user@example.com
  node scripts/manage-admin.js list-admins
  node scripts/manage-admin.js check-admin user@example.com

Environment:
  Make sure .env file is configured with Firebase credentials.
  `);
}

async function main() {
  const [,, command, ...args] = process.argv;

  if (!command || command === 'help') {
    showHelp();
    return;
  }

  if (!commands[command]) {
    console.error(`❌ Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }

  try {
    await commands[command](...args);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { setAdmin, revokeAdmin, listAdmins, checkAdmin };
