import {BaseModel} from 'src/core/base.model';
import {Column, Entity} from 'typeorm';

@Entity('difficulty')
export class Difficulty extends BaseModel {
    @Column({length: 64, unique: true})
    degree: string;

    @Column({length: 256})
    icon: string
}
