import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { User } from "@/features/auth/entities/user.entity";
import { Permission } from "@/features/auth/entities/permission.entity";
import { BaseModel } from "@/core/base.model";

@Entity("userPermissions")
export class UserPermission extends BaseModel {
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.userPermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user: Relation<User>;

  @Column()
  permissionId: number;

  @ManyToOne(() => Permission, (permission) => permission.userPermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "permissionId" })
  permission: Relation<Permission>;

  @Column()
  isAllowed: boolean;
}
