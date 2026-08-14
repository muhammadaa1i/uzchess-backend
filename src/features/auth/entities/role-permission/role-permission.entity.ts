import { BaseModel } from "@/core/base.model";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { Permission } from "@/features/auth/entities/permission/permission.entity";
import { Role } from "@/features/auth/entities/role/role.entity";

@Entity("rolePermissions")
export class RolePermission extends BaseModel {
  @Column()
  roleId: number;

  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "roleId" })
  role: Relation<Role>;

  @Column()
  permissionId: number;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "permissionId" })
  permission: Relation<Permission>;
}
