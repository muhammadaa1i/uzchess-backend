import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { BaseModel } from "@/core/base.model";
import { User } from "@/features/auth/entities/user/user.entity";
import { OrderItem } from "@/features/library/entities/order/order-item.entity";
import { OrderStatus } from "@/core/enums/order-status.enum";

@Entity("orders")
export class Order extends BaseModel {
  @Column()
  userId: number;

  @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.Processing })
  status: OrderStatus;

  @Column("integer")
  totalPrice: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: Relation<User>;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: Relation<OrderItem>[];
}
