import "reflect-metadata";
import dataSource from "../data-source";
import { seedAdminUser } from "./admin-user.seed";

async function run(): Promise<void> {
  console.log("🌱 সিডিং শুরু হচ্ছে...");

  await dataSource.initialize();

  try {
    await seedAdminUser(dataSource);
    // ভবিষ্যতে নতুন সিড ফাংশন এখানে যোগ হবে, যেমন:
    // await seedCategories(dataSource);
    // await seedPublishers(dataSource);
    console.log("✅ সিডিং সম্পন্ন।");
  } catch (error) {
    console.error("❌ সিডিং ব্যর্থ হয়েছে:", error);
    process.exitCode = 1;
  } finally {
    await dataSource.destroy();
  }
}

void run();
