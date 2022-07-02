import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Category } from "./category";
import { Chapter } from "./chapter";
@Entity()
export class Course extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    name: string
    @Column({
        default: "",
        length: 255
    })
    description: string
    @Column({nullable: true})
    image: string
    @ManyToOne(
        () => Category,
        category => category.courses
    )
    @JoinColumn({
        name: 'category_id'
    })
    category: Category

    @OneToMany(
        () => Chapter,
        chapter => chapter.course
    )
    chapters: Chapter[]
}