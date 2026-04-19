/**
 * Create initial admin user
 * Run with: tsx src/scripts/createAdmin.ts
 */

import bcrypt from 'bcrypt';
import { db } from '../config/database.js';

async function createAdmin() {
  const email = process.argv[2] || 'admin@baseball.fr';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Admin';

  console.log('Creating admin user...');
  console.log('Email:', email);
  console.log('Password:', password);

  try {
    // Check if user exists
    const existing = await db.query<any[]>(
      'SELECT id FROM admin_users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      console.log('❌ User with this email already exists');
      process.exit(1);
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await db.execute(
      'INSERT INTO admin_users (email, password_hash, name, role, active) VALUES (?, ?, ?, ?, ?)',
      [email, passwordHash, name, 'admin', 1]
    );

    console.log('✅ Admin user created successfully!');
    console.log('ID:', (result as any).lastInsertRowid);
    console.log('\nYou can now login with:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    await db.close();
    process.exit(1);
  }
}

createAdmin();
