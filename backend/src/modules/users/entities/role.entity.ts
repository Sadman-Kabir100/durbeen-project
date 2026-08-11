import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "@/common/entities/base.entity";
import { UserRole } from "./user-role.entity";
import { RolePermission } from "./role-permission.entity";

@Entity("roles")
export class Role extends BaseEntity {
  @Column({ type: "varchar", length: 50, unique: true })
  name!: string;

  @Column({ type: "varchar", length: 50, unique: true })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ name: "is_system", type: "boolean", default: false })
  isSystem!: boolean;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles?: UserRole[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions?: RolePermission[];
}
