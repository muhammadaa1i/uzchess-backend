import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { BaseModel } from "@/core/base.model";
import { Order } from "@/features/library/entities/order/order.entity";
import { Book } from "@/features/library/entities/book/book.entity";

@Entity("order_items")
export class OrderItem extends BaseModel {
  @Column()
  orderId: number;

  @Column()
  bookId: number;

  @Column("integer")
  price: number;

  @ManyToOne(() => Order, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order: Relation<Order>;

  @ManyToOne(() => Book, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bookId" })
  book: Relation<Book>;
}
