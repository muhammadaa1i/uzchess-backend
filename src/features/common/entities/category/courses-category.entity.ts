import {Column, Entity} from "typeorm";
import {BaseModel} from "@/core/base.model";

@Entity("courseCategories")
export class CoursesCategory extends BaseModel {
    @Column({length: 32})
    title: string;
}
