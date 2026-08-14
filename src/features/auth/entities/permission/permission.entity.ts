import { BaseModel } from "@/core/base.model";
import { Column, Entity, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { RolePermission } from "@/features/auth/entities/role-permission/role-permission.entity";
import { UserPermission } from "@/features/auth/entities/user-permission/user-permission.entity";

@Entity("permissions")
export class Permission extends BaseModel {
  @Column({ length: 64 })
  resource: string;

  @Column({ length: 64 })
  action: string;

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  rolePermissions: Relation<RolePermission>[];

  @OneToMany(() => UserPermission, (ur) => ur.permission)
  userPermissions: Relation<UserPermission>[];
}
