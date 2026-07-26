import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { BaseModel } from "@/core/base.model";
import { Book } from "@/features/library/entities/book/book.entity";
import { User } from "@/features/auth/entities/user.entity";

@Entity("favourites")
@Index(["bookId", "userId"], { unique: true })
export class Favourite extends BaseModel {
  @Column()
  bookId: number;

  @Column()
  userId: number;

  @ManyToOne(() => Book, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bookId" })
  book: Relation<Book>;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: Relation<User>;
}
