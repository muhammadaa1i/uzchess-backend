import { Column, Entity, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { BaseModel } from "@/core/base.model";
import { UserRole } from "@/features/auth/entities/user.role.entity";
import { UserPermission } from "@/features/auth/entities/user-permission.entity";

@Entity("users")
export class User extends BaseModel {
  @Column({ length: 64, unique: true })
  username: string;

  @Column({ length: 64 })
  fullName: string;

  @Column({ length: 128 })
  password: string;

  @OneToMany(() => UserRole, (ur) => ur.user)
  userRoles: Relation<UserRole>[];

  @OneToMany(() => UserPermission, (up) => up.user)
  userPermissions: Relation<UserPermission>[];
}
