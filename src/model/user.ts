import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Role } from '../types/role.enum';
import { Lab } from "./lab";
@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    firstname: string
    @Column()
    lastname: string
    @Column()
    email: string
    @Column()
    password: string
    @Column({
        nullable: true
    })
    image: string
    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER
    })
    role: Role
    @Column({
        nullable: true
    })
    active: Date
    @OneToMany(
        () => Lab,
        lab => lab.user
    )
    labs: Lab[]
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}