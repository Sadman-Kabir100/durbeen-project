import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 * আগের "সম্পূর্ণ PostgreSQL ডাটাবেস স্কিমা" ডকুমেন্টের ডিজাইন নীতি #১ ও #২ অনুযায়ী:
 * সব টেবিলে UUID প্রাইমারি কী এবং created_at/updated_at টাইমস্ট্যাম্প।
 * প্রতিটি এনটিটি ক্লাস এই abstract base ইনহেরিট করবে, যাতে বয়লারপ্লেট পুনরাবৃত্তি না হয়।
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt!: Date;
}
