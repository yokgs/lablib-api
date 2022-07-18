import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Lab } from "./lab";
@Entity()
export class Step  extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    name: string
    @Column({nullable:true})
    demo: string
    @Column()
    content: string
    @Column()
    rang: number
    @ManyToOne(
        () => Lab,
        lab => lab.steps
    )
    @JoinColumn({
        name: 'lab_id'
    })
    lab: Lab
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}