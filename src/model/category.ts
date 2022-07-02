import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm";
import { Course } from "./course";
@Entity()
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    name: string
    @Column({
        length: 255,
        default: ""
    })
    description: string
    @Column({
        nullable: true
    })
    image: string
    @OneToMany(
        () => Course,
        course => course.category
    )
    courses: Course[]
}