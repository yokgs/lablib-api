import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class ImageEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string
    @Column({
        type: 'bytea'
    })
    content: Buffer
    @Column({default: false}) isDefault: boolean
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}