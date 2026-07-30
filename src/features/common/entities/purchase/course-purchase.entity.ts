import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { BaseModel } from "@/core/base.model";
import { Course } from "@/features/common/entities/course/course.entity";
import { User } from "@/features/auth/entities/user.entity";

@Entity("coursePurchases")
@Index(["courseId", "userId"], { unique: true })
export class CoursePurchase extends BaseModel {
  @Column()
  courseId: number;

  @Column()
  userId: number;

  @ManyToOne(() => Course, { onDelete: "CASCADE" })
  @JoinColumn({ name: "courseId" })
  course: Relation<Course>;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: Relation<User>;
}
