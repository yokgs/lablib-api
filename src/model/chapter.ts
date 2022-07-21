import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Course } from "./course";
import { Lab } from "./lab";
@Entity()
export class Chapter extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    name: string
    @Column({
        default: 1
    }) order: number
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
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}