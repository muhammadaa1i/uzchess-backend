import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import type {Relation} from "typeorm";
import {BaseModel} from "@/core/base.model";
import {Course} from "@/features/common/entities/course/course.entity";
import {Author} from "@/features/library/entities/author/author.entity";

@Entity("courseAuthors")
export class CourseAuthor extends BaseModel {
    @Column()
    courseId: number;

    @Column()
    authorId: number;

    @ManyToOne(() => Course, (course) => course.courseAuthors, {
        onDelete: "CASCADE",
    })
    @JoinColumn({name: "courseId"})
    course: Relation<Course>;

    @ManyToOne(() => Author, {onDelete: "CASCADE"})
    @JoinColumn({name: "authorId"})
    author: Relation<Author>;
}
