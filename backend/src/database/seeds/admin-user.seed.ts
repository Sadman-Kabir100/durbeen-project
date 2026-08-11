import type { DataSource } from "typeorm";

/**
 * ⚠️ এই সিড শুধু ততটুকুই করে যতটা এই মুহূর্তে বাস্তবসম্মত: একটা অ্যাডমিন ইউজার তৈরি করা
 * ও "admin" রোল অ্যাসাইন করা (roles টেবিলের ডেটা InitAuthSchema migration-এই সিড করা
 * হয়েছে, এখানে পুনরায় করা হচ্ছে না)। Product/Category/Publisher/Author-এর মতো
 * catalog সিড ডেটা এখানে রাখা হয়নি কারণ সেই মডিউলগুলো এখনো তৈরি হয়নি — মিথ্যা দাবি
 * এড়াতে ইচ্ছাকৃতভাবে বাদ দেওয়া হলো।
 *
 * প্রয়োজনীয় env var: ADMIN_SEED_PHONE, ADMIN_SEED_NAME (মূল .env.example এ যোগ করুন)
 */
export async function seedAdminUser(dataSource: DataSource): Promise<void> {
  const phone = process.env.ADMIN_SEED_PHONE;
  const name = process.env.ADMIN_SEED_NAME ?? "Durbeen Admin";

  if (!phone) {
    console.warn(
      "⚠️  ADMIN_SEED_PHONE সেট করা নেই (.env এ) — অ্যাডমিন ইউজার সিড স্কিপ করা হলো।"
    );
    return;
  }

  const existingUser: { id: string } | undefined = await dataSource.query(
    `SELECT id FROM users WHERE phone = $1 LIMIT 1`,
    [phone]
  ).then((rows: { id: string }[]) => rows[0]);

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
    console.log(`ℹ️  ইউজার "${phone}" ইতিমধ্যে বিদ্যমান (id: ${userId}) — নতুন তৈরি করা হলো না।`);
  } else {
    const inserted: { id: string }[] = await dataSource.query(
      `INSERT INTO users (name, phone, status, phone_verified_at)
       VALUES ($1, $2, 'active', now())
       RETURNING id`,
      [name, phone]
    );
    userId = inserted[0]!.id;
    console.log(`✅ অ্যাডমিন ইউজার তৈরি হয়েছে: ${name} (${phone}), id: ${userId}`);
  }

  const adminRole: { id: string } | undefined = await dataSource
    .query(`SELECT id FROM roles WHERE slug = 'admin' LIMIT 1`)
    .then((rows: { id: string }[]) => rows[0]);

  if (!adminRole) {
    console.error('❌ "admin" রোল পাওয়া যায়নি — প্রথমে migration চালিয়েছেন কিনা যাচাই করুন (npm run migration:run)।');
    return;
  }

  const existingUserRole: { user_id: string } | undefined = await dataSource
    .query(`SELECT user_id FROM user_roles WHERE user_id = $1 AND role_id = $2 LIMIT 1`, [
      userId,
      adminRole.id,
    ])
    .then((rows: { user_id: string }[]) => rows[0]);

  if (existingUserRole) {
    console.log(`ℹ️  ইউজার "${phone}" ইতিমধ্যে "admin" রোলপ্রাপ্ত।`);
    return;
  }

  await dataSource.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, [
    userId,
    adminRole.id,
  ]);
  console.log(`✅ "admin" রোল অ্যাসাইন করা হয়েছে ইউজার "${phone}"-কে।`);
}
