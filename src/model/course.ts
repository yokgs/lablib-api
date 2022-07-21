import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany } from "typeorm";
import { Category } from "./category";
import { Chapter } from "./chapter";
import { User } from "./user";
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

    @Column({ nullable: true })
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

    @ManyToMany(
        () => User,
        user => user.favorites
    )
    followers: User[]
    
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}