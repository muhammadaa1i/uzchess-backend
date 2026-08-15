import { Column, Entity } from "typeorm";
import { BaseModel } from "@/core/base.model";
import { PlayerTitle } from "@/core/enums/player-title.enum";

@Entity("players")
export class Player extends BaseModel {
  @Column({ length: 128 })
  name: string;

  @Column({ type: "varchar", length: 256, nullable: true })
  avatarUrl: string | null;

  @Column({ length: 3 })
  country: string;

  @Column({ type: "enum", enum: PlayerTitle, default: PlayerTitle.None })
  title: PlayerTitle;

  @Column("integer")
  classicalRating: number;

  @Column("integer", { nullable: true })
  classicalRatingChange: number | null;

  @Column("integer")
  rapidRating: number;

  @Column("integer", { nullable: true })
  rapidRatingChange: number | null;

  @Column("integer")
  blitzRating: number;

  @Column("integer", { nullable: true })
  blitzRatingChange: number | null;

  @Column("integer", { nullable: true })
  rankChange: number | null;
}
