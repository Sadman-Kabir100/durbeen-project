import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from "@/common/entities/base.entity";
import { UserRole } from "./user-role.entity";

export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  DELETED = "deleted",
}

/**
 * ডাটাবেজ স্কিমা ডকুমেন্টের `users` টেবিলের সাথে ১:১ ম্যাপড।
 * এই এনটিটি Authentication মডিউলে সংজ্ঞায়িত হলেও এটি users মডিউলের অধীনে রাখা হয়েছে
 * (src/modules/users/entities), কারণ পরবর্তী "User Management" ধাপে এই একই এনটিটির
 * উপর প্রোফাইল CRUD, ঠিকানা সম্পর্ক ইত্যাদি তৈরি হবে — Auth শুধু এটি import করে ব্যবহার করে।
 */
@Entity("users")
export class User extends BaseEntity {
  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Index("idx_users_phone", { unique: true })
  @Column({ type: "varchar", length: 20, unique: true })
  phone!: string;

  @Column({ type: "varchar", length: 150, unique: true, nullable: true })
  email?: string | null;

  @Column({ name: "password_hash", type: "varchar", length: 255, nullable: true, select: false })
  passwordHash?: string | null;

  @Column({ name: "avatar_url", type: "text", nullable: true })
  avatarUrl?: string | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  gender?: string | null;

  @Column({ name: "date_of_birth", type: "date", nullable: true })
  dateOfBirth?: string | null;

  @Column({ name: "phone_verified_at", type: "timestamptz", nullable: true })
  phoneVerifiedAt?: Date | null;

  @Column({ name: "email_verified_at", type: "timestamptz", nullable: true })
  emailVerifiedAt?: Date | null;

  @Index("idx_users_status")
  @Column({ type: "varchar", length: 20, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ name: "last_login_at", type: "timestamptz", nullable: true })
  lastLoginAt?: Date | null;

  @Column({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt?: Date | null;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles?: UserRole[];
}
