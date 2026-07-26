import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { BaseModel } from "@/core/base.model";
import { Book } from "@/features/library/entities/book/book.entity";
import { Author } from "@/features/library/entities/author/author.entity";

@Entity("bookAuthors")
export class BookAuthor extends BaseModel {
  @Column()
  bookId: number;

  @Column()
  authorId: number;

  @ManyToOne(() => Book, (book) => book.bookAuthors, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bookId" })
  book: Relation<Book>;

  @ManyToOne(() => Author, { onDelete: "CASCADE" })
  @JoinColumn({ name: "authorId" })
  author: Relation<Author>;
}
