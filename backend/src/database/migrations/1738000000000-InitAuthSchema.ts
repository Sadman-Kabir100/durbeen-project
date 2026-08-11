import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * এই মাইগ্রেশন আগের "সম্পূর্ণ PostgreSQL ডাটাবেস স্কিমা" ডকুমেন্টের
 * টেবিল #১ (roles), #২ (permissions), #৩ (role_permissions),
 * #৪ (users), #৫ (user_roles) — এই পাঁচটি হুবহু তৈরি করে,
 * যেহেতু এই পাঁচটিই Authentication মডিউলের জন্য প্রয়োজনীয়।
 * বাকি টেবিলগুলো (products, orders...) সংশ্লিষ্ট মডিউল তৈরির সময় নতুন migration-এ আসবে।
 */
export class InitAuthSchema1738000000000 implements MigrationInterface {
  name = "InitAuthSchema1738000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await queryRunner.query(`
      CREATE TABLE roles (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(50) NOT NULL UNIQUE,
        slug        VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        is_system   BOOLEAN NOT NULL DEFAULT false,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE permissions (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(100) NOT NULL UNIQUE,
        slug        VARCHAR(100) NOT NULL UNIQUE,
        module      VARCHAR(50) NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_permissions_module ON permissions(module)`);

    await queryRunner.query(`
      CREATE TABLE role_permissions (
        role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (role_id, permission_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE users (
        id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name               VARCHAR(150) NOT NULL,
        phone              VARCHAR(20) NOT NULL UNIQUE,
        email              VARCHAR(150) UNIQUE,
        password_hash      VARCHAR(255),
        avatar_url         TEXT,
        gender             VARCHAR(10),
        date_of_birth      DATE,
        phone_verified_at  TIMESTAMPTZ,
        email_verified_at  TIMESTAMPTZ,
        status             VARCHAR(20) NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active','suspended','deleted')),
        last_login_at      TIMESTAMPTZ,
        created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at         TIMESTAMPTZ
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL AND email IS NOT NULL`
    );
    await queryRunner.query(`CREATE INDEX idx_users_status ON users(status)`);

    await queryRunner.query(`
      CREATE TABLE user_roles (
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, role_id)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_user_roles_role_id ON user_roles(role_id)`);

    // --- সিড ডেটা: ডিফল্ট সিস্টেম রোল ---
    // "customer" রোল UsersService.assignDefaultRole()-এ হার্ডকোডেড রেফারেন্স করা হয় (auth.constants ঘেঁষা)।
    await queryRunner.query(`
      INSERT INTO roles (name, slug, description, is_system) VALUES
        ('Customer', 'customer', 'সাধারণ গ্রাহক — ডিফল্ট রোল প্রতিটি নতুন রেজিস্ট্রেশনে', true),
        ('Admin', 'admin', 'পূর্ণ অ্যাডমিন অ্যাক্সেস', true),
        ('Staff', 'staff', 'সীমিত অ্যাডমিন অ্যাক্সেস (অর্ডার/প্রোডাক্ট ম্যানেজমেন্ট)', true),
        ('Warehouse', 'warehouse', 'ইনভেন্টরি ও শিপমেন্ট স্টাফ', true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS user_roles`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
    await queryRunner.query(`DROP TABLE IF EXISTS role_permissions`);
    await queryRunner.query(`DROP TABLE IF EXISTS permissions`);
    await queryRunner.query(`DROP TABLE IF EXISTS roles`);
  }
}
