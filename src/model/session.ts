import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from "typeorm";
import { SessionEntity } from "typeorm-store"
@Entity()
export class SessionContainer extends BaseEntity implements SessionEntity {
    @PrimaryColumn()
    id: string

    @Column()
    data: string

    @Column() expiresAt: number

    @CreateDateColumn()
    createdAt: Date;
}