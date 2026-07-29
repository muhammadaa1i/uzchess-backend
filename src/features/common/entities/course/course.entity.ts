import {Column, Entity, JoinColumn, ManyToOne, OneToMany} from "typeorm";
import type {Relation} from "typeorm";
import {BaseModel} from "@/core/base.model";
import {CoursesCategory} from "@/features/common/entities/category/courses-category.entity";
import {Difficulty} from "@/features/library/entities/difficulty/difficulty.entity";
import {Language} from "@/features/library/entities/languages/language.entity";
import {CourseAuthor} from "@/features/common/entities/course/course-author.entity";
import {CourseSection} from "@/features/common/entities/section/course-section.entity";

@Entity("courses")
export class Course extends BaseModel {
    @Column({length: 256})
    title: string;

    @Column("integer")
    price: number;

    @Column("integer", {nullable: true})
    discountPrice: number | null;

    @Column({length: 256})
    cover: string;

    @Column("text", {nullable: true})
    description: string | null;

    @Column()
    categoryId: number;

    @ManyToOne(() => CoursesCategory)
    @JoinColumn({name: "categoryId"})
    category: Relation<CoursesCategory>;

    @Column()
    difficultyId: number;

    @ManyToOne(() => Difficulty)
    @JoinColumn({name: "difficultyId"})
    difficulty: Relation<Difficulty>;

    @Column()
    languageId: number;

    @ManyToOne(() => Language)
    @JoinColumn({name: "languageId"})
    language: Relation<Language>;

    @OneToMany(() => CourseAuthor, (ca) => ca.course)
    courseAuthors: Relation<CourseAuthor>[];

    @OneToMany(() => CourseSection, (s) => s.course)
    sections: Relation<CourseSection>[];
}
