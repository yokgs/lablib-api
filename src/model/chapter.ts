import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Course } from "./course";
import { Lab } from "./lab";
@Entity()
export class Chapter extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    name: string
    @ManyToOne(
        () => Course,
        course=>course.chapters
    )
    @JoinColumn({
        name:"course_id",
    })
    course: Course
    @OneToMany(
        () => Lab,
        lab => lab.chapter
    )
    labs: Lab[]
}