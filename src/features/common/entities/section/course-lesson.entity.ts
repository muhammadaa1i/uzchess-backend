import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import type {Relation} from "typeorm";
import {BaseModel} from "@/core/base.model";
import {CourseSection} from "@/features/common/entities/section/course-section.entity";

@Entity("courseLessons")
export class CourseLesson extends BaseModel {
    @Column()
    sectionId: number;

    @Column({length: 256})
    title: string;

    @Column({length: 256})
    video: string;

    @Column("varchar", {length: 256, nullable: true})
    thumbnail: string | null;

    @Column("integer")
    duration: number;

    @Column("integer")
    order: number;

    @ManyToOne(() => CourseSection, (section) => section.lessons, {
        onDelete: "CASCADE",
    })
    @JoinColumn({name: "sectionId"})
    section: Relation<CourseSection>;
}
