import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Role } from "./role.entity";
import { Permission } from "./permission.entity";

/**
 * ডাটাবেজ স্কিমা ডকুমেন্টের role_permissions টেবিল — composite PK (role_id, permission_id)।
 * এখানে BaseEntity ইনহেরিট করা হয়নি কারণ এই টেবিলের নিজস্ব single UUID PK নেই,
 * বরং composite PK — তাই আলাদাভাবে সংজ্ঞায়িত।
 */
@Entity("role_permissions")
export class RolePermission {
  @PrimaryColumn({ name: "role_id", type: "uuid" })
  roleId!: string;

  @PrimaryColumn({ name: "permission_id", type: "uuid" })
  permissionId!: string;

  @ManyToOne(() => Role, (role) => role.rolePermissions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "role_id" })
  role!: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "permission_id" })
  permission!: Permission;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date;
}
