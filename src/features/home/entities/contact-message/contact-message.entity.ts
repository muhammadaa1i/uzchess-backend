import { Column, Entity } from "typeorm";
import { BaseModel } from "@/core/base.model";

@Entity("contact_messages")
export class ContactMessage extends BaseModel {
  @Column({ length: 256 })
  name: string;

  @Column({ length: 256 })
  email: string;

  @Column("text")
  message: string;
}
