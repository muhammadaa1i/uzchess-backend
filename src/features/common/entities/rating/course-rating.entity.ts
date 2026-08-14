import {Column, Entity, Index, JoinColumn, ManyToOne} from "typeorm";
import type {Relation} from "typeorm";
import {BaseModel} from "@/core/base.model";
import {Course} from "@/features/common/entities/course/course.entity";
import {User} from "@/features/auth/entities/user/user.entity";

@Entity("courseRatings")
@Index(["courseId", "userId"], {unique: true})
export class CourseRating extends BaseModel {
    @Column()
    courseId: number;

    @Column()
    userId: number;

    @Column("smallint")
    score: number;

    @Column("text", {nullable: true})
    comment: string | null;

    @ManyToOne(() => Course, {onDelete: "CASCADE"})
    @JoinColumn({name: "courseId"})
    course: Relation<Course>;

    @ManyToOne(() => User, {onDelete: "CASCADE"})
    @JoinColumn({name: "userId"})
    user: Relation<User>;
}
