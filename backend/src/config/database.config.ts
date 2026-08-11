import { registerAs } from "@nestjs/config";
import type { TypeOrmModuleOptions } from "@nestjs/typeorm";

/**
 * নোট: entities এখানে glob pattern দিয়ে অটো-লোড করা হচ্ছে যাতে নতুন মডিউল
 * (Product, Category, Order ইত্যাদি) যোগ হলে এই ফাইল টাচ করতে না হয়।
 * migrations glob দিয়ে src/database/migrations ফোল্ডার থেকে লোড হয়।
 */
export default registerAs("database", (): TypeOrmModuleOptions => ({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: parseInt(process.env.DB_PORT ?? "5432", 10),
  username: process.env.DB_USERNAME ?? "durbeen",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_DATABASE ?? "durbeen_db",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  entities: [__dirname + "/../modules/**/entities/*.entity{.ts,.js}"],
  migrations: [__dirname + "/../database/migrations/*{.ts,.js}"],
  synchronize: false, // প্রোডাকশনে কখনোই true না — সবসময় migration দিয়ে schema change
  logging: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
}));
