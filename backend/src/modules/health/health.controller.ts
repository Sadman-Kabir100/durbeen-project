import { Controller, Get } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import type { DataSource } from "typeorm";
import { Public } from "@/modules/auth/decorators/public.decorator";

/**
 * এই এন্ডপয়েন্ট তিন জায়গায় ব্যবহৃত হবে: (১) Dockerfile-এর HEALTHCHECK,
 * (২) Nginx upstream health check, (৩) Monitoring সিস্টেমের uptime probe।
 * ডাটাবেজ কানেকশন পিং করা হয় কারণ "প্রসেস চলছে" আর "সার্ভিস আসলে কাজ করছে"
 * এক জিনিস না — DB down থাকলে অ্যাপ প্রসেস alive থাকলেও কার্যত অকেজো,
 * তাই health check শুধু process liveness না, dependency readiness ও যাচাই করে।
 */
@Controller("health")
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Public()
  @Get()
  async check(): Promise<{ status: string; database: string; timestamp: string }> {
    let database = "down";
    try {
      await this.dataSource.query("SELECT 1");
      database = "up";
    } catch {
      database = "down";
    }

    return {
      status: database === "up" ? "ok" : "degraded",
      database,
      timestamp: new Date().toISOString(),
    };
  }
}
