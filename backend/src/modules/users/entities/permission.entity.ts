import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from "@/common/entities/base.entity";
import { RolePermission } from "./role-permission.entity";

@Entity("permissions")
export class Permission extends BaseEntity {
  @Column({ type: "varchar", length: 100, unique: true })
  name!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  slug!: string;

  @Index("idx_permissions_module")
  @Column({ type: "varchar", length: 50 })
  module!: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions?: RolePermission[];
}
