import { db } from '../db';
import { logger } from '../utils/logger';

/**
 * Bootstrap admin + sources. Run with: npm run seed
 */
async function seed() {
  if (!db.isConfigured) {
    console.error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (email && password) {
    const { data: existing } = await db.admin.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) {
      await db.admin.from('users').update({ role: 'admin', is_active: true }).eq('id', existing.id);
      logger.info('seed', `Admin ensured for ${email}`);
    } else {
      await db.admin.from('users').insert({ email, full_name: 'Administrator', role: 'admin' });
      logger.info('seed', `Admin created for ${email}. Password is managed by Supabase Auth — sign in first.`);
    }
  }

  logger.info('seed', 'Seed complete. Now run supabase/schema.sql and supabase/seed.sql in the SQL editor if not already done.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
