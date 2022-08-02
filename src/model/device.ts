import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Chapter } from "./chapter";
import { Step } from "./step";
import { User } from "./user";
import { Level } from "../types/level.enum";

@Entity()
export class Device extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    identifier: string;
    @Column()
    token: string;
    
    @ManyToOne(
        () => User,
        user => user.devices
    )
    @JoinColumn({
        name: 'user_id'
    })
    user: User

    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}