import {Column, Entity, Index, JoinColumn, ManyToOne} from "typeorm";
import type {Relation} from "typeorm";
import {BaseModel} from "@/core/base.model";
import {Course} from "@/features/common/entities/course/course.entity";
import {User} from "@/features/auth/entities/user/user.entity";

@Entity("certificates")
@Index(["courseId", "userId"], {unique: true})
export class Certificate extends BaseModel {
    @Column()
    courseId: number;

    @Column()
    userId: number;

    @Column({unique: true})
    code: string;

    @ManyToOne(() => Course, {onDelete: "CASCADE"})
    @JoinColumn({name: "courseId"})
    course: Relation<Course>;

    @ManyToOne(() => User, {onDelete: "CASCADE"})
    @JoinColumn({name: "userId"})
    user: Relation<User>;
}
