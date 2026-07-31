import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { BaseModel } from "@/core/base.model";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { User } from "@/features/auth/entities/user.entity";

@Entity("lessonProgresses")
@Index(["lessonId", "userId"], { unique: true })
export class LessonProgress extends BaseModel {
  @Column()
  lessonId: number;

  @Column()
  userId: number;

  @ManyToOne(() => CourseLesson, { onDelete: "CASCADE" })
  @JoinColumn({ name: "lessonId" })
  lesson: Relation<CourseLesson>;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: Relation<User>;
}
