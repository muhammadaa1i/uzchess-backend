import {Column, Entity} from "typeorm";
import {BaseModel} from "@/core/base.model";

@Entity("news")
export class News extends BaseModel {
    @Column({length: 256})
    title: string;

    @Column("text")
    excerpt: string;

    @Column({type: "varchar", length: 256, nullable: true})
    imageUrl: string | null;

    @Column({type: "date"})
    publishedAt: Date;
}
