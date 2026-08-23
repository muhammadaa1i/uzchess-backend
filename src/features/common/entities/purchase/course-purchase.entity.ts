import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { BaseModel } from "@/core/base.model";
import { Course } from "@/features/common/entities/course/course.entity";
import { User } from "@/features/auth/entities/user/user.entity";
import { PurchaseStatus } from "@/core/enums/purchase-status/purchase-status.enum";

@Entity("coursePurchases")
@Index(["courseId", "userId"], { unique: true })
export class CoursePurchase extends BaseModel {
  @Column()
  courseId: number;

  @Column()
  userId: number;

  @Column({ type: "enum", enum: PurchaseStatus, default: PurchaseStatus.Pending })
  status: PurchaseStatus;

  @ManyToOne(() => Course, { onDelete: "CASCADE" })
  @JoinColumn({ name: "courseId" })
  course: Relation<Course>;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: Relation<User>;
}
