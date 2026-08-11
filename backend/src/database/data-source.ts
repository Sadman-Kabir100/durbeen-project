import "reflect-metadata";
import { config } from "dotenv";
import { DataSource } from "typeorm";

config();

/**
 * এটি শুধু `npm run migration:*` CLI কমান্ডের জন্য — অ্যাপ রানটাইমে
 * src/config/database.config.ts এর মাধ্যমে NestJS TypeOrmModule.forRootAsync ব্যবহৃত হয়।
 * দুটো আলাদা রাখা হয়েছে কারণ TypeORM CLI NestJS DI কনটেক্সটের বাইরে চলে।
 */
export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: parseInt(process.env.DB_PORT ?? "5432", 10),
  username: process.env.DB_USERNAME ?? "durbeen",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_DATABASE ?? "durbeen_db",
  entities: ["src/modules/**/entities/*.entity{.ts,.js}"],
  migrations: ["src/database/migrations/*{.ts,.js}"],
});
