import { Column, Entity } from 'typeorm';
import { BaseModel } from '@/core/base.model';

@Entity('category')
export class Category extends BaseModel {
  @Column({ type: 'varchar', length: 64, unique: true })
  title: string;
}
