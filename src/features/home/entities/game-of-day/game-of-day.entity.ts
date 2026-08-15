import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { BaseModel } from "@/core/base.model";
import { Player } from "@/features/home/entities/player/player.entity";
import { GameType } from "@/core/enums/game-type.enum";

@Entity("gamesOfDay")
export class GameOfDay extends BaseModel {
  @Column({ length: 256 })
  videoUrl: string;

  @Column({ length: 256 })
  thumbnailUrl: string;

  @Column("integer")
  durationSeconds: number;

  @Column({ type: "timestamp", precision: 0 })
  liveStartTime: Date;

  @Column({ type: "enum", enum: GameType })
  gameType: GameType;

  @Column()
  whitePlayerId: number;

  @ManyToOne(() => Player, { onDelete: "CASCADE" })
  @JoinColumn({ name: "whitePlayerId" })
  whitePlayer: Relation<Player>;

  @Column()
  blackPlayerId: number;

  @ManyToOne(() => Player, { onDelete: "CASCADE" })
  @JoinColumn({ name: "blackPlayerId" })
  blackPlayer: Relation<Player>;

  @Column({ default: false })
  isActive: boolean;
}
