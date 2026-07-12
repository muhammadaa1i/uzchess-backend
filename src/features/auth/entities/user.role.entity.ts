import {BaseModel} from "@/core/base.model";
import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import type {Relation} from "typeorm";
import {Role} from "@/features/auth/entities/role.entity";
import {User} from "@/features/auth/entities/user.entity";

@Entity('userRoles')
export class UserRole extends BaseModel {
    @Column()
    userId: number

    @Column()
    roleId: number

    @ManyToOne(() => User, (user) => user.userRoles, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'userId'})
    user: Relation<User>

    @ManyToOne(() => Role, (role) => role.userRoles, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'roleId'})
    role: Relation<Role>
}