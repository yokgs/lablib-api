import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Chapter } from "./chapter";
import { Step } from "./step";
import { User } from "./user";
@Entity()
export class Lab extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    name: string
    @Column()
    duration: number
    @Column()
    level: string
    @ManyToOne(
        () => User,
        user => user.labs
    )
    @JoinColumn({
        name: 'user_id'
    })
    user: User
    @ManyToOne(
        () => Chapter,
        chapter => chapter.labs
    )
    @JoinColumn({
        name: 'chapter_id'
    })
    chapter: Chapter
    @OneToMany(
        () => Step,
        step => step.lab
    )
    steps: Step[]
}