import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>("app.apiPrefix", "api/v1");
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO-তে সংজ্ঞায়িত না থাকা এক্সট্রা ফিল্ড স্বয়ংক্রিয়ভাবে বাদ
      forbidNonWhitelisted: true, // অপরিচিত ফিল্ড এলে এরর (silent data loss এড়াতে)
      transform: true, // প্লেইন অবজেক্টকে DTO ক্লাস ইনস্ট্যান্সে রূপান্তর করে (@Type() decorators কাজ করার জন্য দরকার)
    })
  );

  app.use(cookieParser());

  app.enableCors({
    origin: configService.get<string>("app.nodeEnv") === "production"
      ? [
          "https://durbeen-project.vercel.app",
          /^https:\/\/durbeen-project.*\.vercel\.app$/,
          "https://www.durbeen.com",
        ]
      : true, // ডেভেলপমেন্টে সব origin অনুমোদিত
    credentials: true, // httpOnly refresh-token cookie পাঠাতে/গ্রহণ করতে আবশ্যক
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : configService.get<number>("app.port", 4000);
  await app.listen(port, "0.0.0.0");
  // eslint-disable-next-line no-console
  console.log(`🚀 Durbeen API চলছে: http://0.0.0.0:${port}/${apiPrefix}`);
}

void bootstrap();
