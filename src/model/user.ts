import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { Role } from '../types/role.enum';
import { Course } from "./course";
import { Device } from "./device";
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

    @Column({
        default: false
    })
    MFA: boolean

    @OneToMany(
        () => Lab,
        lab => lab.user
    )
    labs: Lab[]

    @OneToMany(
        () => Device,
        device => device.user
    )
    devices: Device[];

    @ManyToMany(
        () => Course,
        course => course.followers
    )
    @JoinTable({
        name: 'favorites',
        inverseJoinColumn: { name: 'course', referencedColumnName: 'id' },
        joinColumn: { name: 'user', referencedColumnName: 'id' }
    })
    favorites: Course[]

    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}