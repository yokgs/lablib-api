import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Chapter } from "./chapter";
import { Step } from "./step";
import { User } from "./user";
import { Level } from "../types/level.enum";

@Entity()
export class Lab extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({
        default: "",
        length: 255
    })
    description: string

    @Column({
        default: 1800
    })
    duration: number

    @Column({
        default: Level.easy,
        type: 'enum',
        enum: Level
    })
    level: Level

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

    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
    
}