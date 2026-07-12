import { BaseModel } from '@/core/base.model';
import { Column, Entity } from 'typeorm';

@Entity('difficulty')
export class Difficulty extends BaseModel {
  @Column({ type: 'varchar', length: 64, unique: true })
  degree: string;
}
