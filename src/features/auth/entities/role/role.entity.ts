import { BaseModel } from "@/core/base.model";
import { Column, Entity, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { UserRole } from "@/features/auth/entities/user-role/user.role.entity";

@Entity("roles")
export class Role extends BaseModel {
  @Column({ length: 64, unique: true })
  title: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @OneToMany(() => UserRole, (ur) => ur.role)
  userRoles: Relation<UserRole>[];
}
