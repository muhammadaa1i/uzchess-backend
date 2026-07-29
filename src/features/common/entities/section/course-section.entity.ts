import {Column, Entity, JoinColumn, ManyToOne, OneToMany} from "typeorm";
import type {Relation} from "typeorm";
import {BaseModel} from "@/core/base.model";
import {Course} from "@/features/common/entities/course/course.entity";
import {CourseLesson} from "@/features/common/entities/section/course-lesson.entity";

@Entity("courseSections")
export class CourseSection extends BaseModel {
    @Column()
    courseId: number;

    @Column({length: 256})
    title: string;

    @Column("integer")
    order: number;

    @ManyToOne(() => Course, {onDelete: "CASCADE"})
    @JoinColumn({name: "courseId"})
    course: Relation<Course>;

    @OneToMany(() => CourseLesson, (lesson) => lesson.section)
    lessons: Relation<CourseLesson>[];
}
