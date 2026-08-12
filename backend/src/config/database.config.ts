import { registerAs } from "@nestjs/config";
import type { TypeOrmModuleOptions } from "@nestjs/typeorm";

/**
 * TypeORM ডাটাবেস কনফিগ:
 * - DB_TYPE=sqlite হলে লোকাল ফাইল-ভিত্তিক SQLite ডাটাবেস (durbeen_db.sqlite)
 * - ডিফল্টে/প্রোডাকশনে PostgreSQL ব্যবহার করে
 */
export default registerAs("database", (): TypeOrmModuleOptions => {
  const dbType = process.env.DB_TYPE || "postgres";

  if (dbType === "sqlite") {
    return {
      type: "sqlite",
      database: process.env.DB_DATABASE || "durbeen_db.sqlite",
      entities: [__dirname + "/../modules/**/entities/*.entity{.ts,.js}"],
      synchronize: true,
      logging: ["error", "warn"],
    };
  }

  return {
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.DB_PORT ?? "5432", 10),
    username: process.env.DB_USERNAME ?? "durbeen",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_DATABASE ?? "durbeen_db",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    entities: [__dirname + "/../modules/**/entities/*.entity{.ts,.js}"],
    migrations: [__dirname + "/../database/migrations/*{.ts,.js}"],
    synchronize: false,
    logging: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  };
});
