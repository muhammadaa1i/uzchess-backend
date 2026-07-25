import {Column, Entity, JoinColumn, ManyToOne, OneToMany} from 'typeorm';
import type {Relation} from 'typeorm';
import {BaseModel} from '@/core/base.model';
import {Category} from '@/features/library/entities/category/category.entity';
import {Difficulty} from '@/features/library/entities/difficulty/difficulty.entity';
import {Language} from '@/features/library/entities/languages/language.entity';
import {BookAuthor} from '@/features/library/entities/book/book-author.entity';

@Entity('books')
export class Book extends BaseModel {
    @Column({length: 256})
    title: string

    @Column('integer')
    price: number

    @Column('integer', {nullable: true})
    discountPrice: number | null

    @Column({length: 256})
    cover: string

    @Column()
    categoryId: number

    @ManyToOne(() => Category)
    @JoinColumn({name: 'categoryId'})
    category: Relation<Category>

    @Column()
    difficultyId: number

    @ManyToOne(() => Difficulty)
    @JoinColumn({name: 'difficultyId'})
    difficulty: Relation<Difficulty>

    @Column()
    languageId: number

    @ManyToOne(() => Language)
    @JoinColumn({name: 'languageId'})
    language: Relation<Language>

    @OneToMany(() => BookAuthor, (ba) => ba.book)
    bookAuthors: Relation<BookAuthor>[]
}
