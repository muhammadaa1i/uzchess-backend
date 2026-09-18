import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { BaseModel } from "@/core/base.model";
import { Player } from "@/features/home/entities/player/player.entity";
import { GameType } from "@/core/enums/game-type/game-type.enum";
import { GameStatus } from "@/core/enums/game-status/game-status.enum";

@Entity("games")
export class Game extends BaseModel {
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

  @Column("integer", { nullable: true })
  whiteScore: number | null;

  @Column("integer", { nullable: true })
  blackScore: number | null;

  @Column({ type: "enum", enum: GameStatus, default: GameStatus.Completed })
  status: GameStatus;

  @Column({ type: "enum", enum: GameType })
  gameType: GameType;

  @Column("integer")
  movesCount: number;

  @Column({ type: "date" })
  playedAt: Date;
}
