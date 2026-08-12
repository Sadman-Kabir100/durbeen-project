import "dotenv/config";
import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { UserRole } from "./user-role.entity";

export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  DELETED = "deleted",
}

const dateType = process.env.DB_TYPE === "sqlite" ? "datetime" : "timestamptz";

@Entity("users")
export class User extends BaseEntity {
  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Index("idx_users_phone", { unique: true })
  @Column({ type: "varchar", length: 20, unique: true })
  phone!: string;

  @Index("idx_users_email", { unique: true })
  @Column({ type: "varchar", length: 150, nullable: true, unique: true })
  email?: string;

  @Column({ name: "password_hash", type: "varchar", length: 255, nullable: true })
  passwordHash?: string;

  @Column({ name: "avatar_url", type: "text", nullable: true })
  avatarUrl?: string;

  @Column({ type: "varchar", length: 10, nullable: true })
  gender?: string;

  @Column({ name: "date_of_birth", type: "date", nullable: true })
  dateOfBirth?: string;

  @Column({ name: "phone_verified_at", type: dateType as any, nullable: true })
  phoneVerifiedAt?: Date;

  @Column({ name: "email_verified_at", type: dateType as any, nullable: true })
  emailVerifiedAt?: Date;

  @Index("idx_users_status")
  @Column({ type: "varchar", length: 20, default: "active" })
  status!: string;

  @Column({ name: "last_login_at", type: dateType as any, nullable: true })
  lastLoginAt?: Date;

  @Column({ name: "deleted_at", type: dateType as any, nullable: true })
  deletedAt?: Date;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles!: UserRole[];
}
