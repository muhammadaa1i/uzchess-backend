import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import type {Relation} from "typeorm";
import {BaseModel} from "@/core/base.model";
import {User} from "@/features/auth/entities/user/user.entity";

@Entity("refreshTokens")
export class RefreshToken extends BaseModel {
    @Column()
    userId: number;

    @Column({length: 64, unique: true})
    tokenHash: string;

    @Column({type: "timestamp", precision: 0})
    expiresAt: string;

    @Column({type: "timestamp", precision: 0, nullable: true})
    revokedAt: string | null;

    @ManyToOne(() => User, {onDelete: "CASCADE"})
    @JoinColumn({name: "userId"})
    user: Relation<User>;
}
