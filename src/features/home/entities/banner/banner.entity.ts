import { Column, Entity } from "typeorm";
import { BaseModel } from "@/core/base.model";

@Entity("banners")
export class Banner extends BaseModel {
  @Column({ length: 128 })
  title: string;

  @Column({ type: "varchar", length: 256, nullable: true })
  subtitle: string | null;

  @Column({ type: "varchar", length: 256, nullable: true })
  imageUrl: string | null;

  @Column({ type: "varchar", length: 256, nullable: true })
  linkUrl: string | null;

  @Column({ type: "varchar", length: 32, nullable: true })
  badgeText: string | null;

  @Column({ default: true })
  isActive: boolean;
}
