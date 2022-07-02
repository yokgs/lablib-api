import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm";
import { Role } from '../types/role.enum';
import { Lab } from "./lab";
@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    firstName: string
    @Column()
    lastName: string
    @Column()
    email: string
    @Column()
    password: string
    @Column()
    image: string
	@Column({
		type: 'enum',
        enum: Role,
        default: Role.USER
	})
    role: Role
    @OneToMany(
        () => Lab,
        lab => lab.user
    )
    labs: Lab[]

}