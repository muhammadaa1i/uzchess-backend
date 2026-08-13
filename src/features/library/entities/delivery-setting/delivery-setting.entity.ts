import { Column, Entity } from "typeorm";
import { BaseModel } from "@/core/base.model";

@Entity("delivery_settings")
export class DeliverySetting extends BaseModel {
  @Column({ type: "integer", default: 0 })
  fee: number;
}
