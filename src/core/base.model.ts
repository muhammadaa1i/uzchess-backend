import {
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export abstract class BaseModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: "timestamp", precision: 0 })
  createdAt: string;

  @UpdateDateColumn({ type: "timestamp", precision: 0 })
  updatedAt: string;
}
