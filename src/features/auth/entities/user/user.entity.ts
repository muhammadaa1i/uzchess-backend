import { Column, Entity, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { BaseModel } from "@/core/base.model";
import { UserRole } from "@/features/auth/entities/user-role/user.role.entity";

@Entity("users")
export class User extends BaseModel {
  @Column({ length: 64 })
  firstName: string;

  @Column({ length: 64 })
  lastName: string;

  @Column({ length: 128 })
  password: string;

  @Column({ type: "varchar", length: 256, nullable: true })
  avatar: string | null;

  @Column({ type: "varchar", length: 128, unique: true, nullable: true })
  email: string | null;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: "date", nullable: true })
  birthDate: Date | null;

  @OneToMany(() => UserRole, (ur) => ur.user)
  userRoles: Relation<UserRole>[];
}
