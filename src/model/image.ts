import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm";

@Entity()
export class ImageEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string
    @Column({
        type: 'bytea'
    })
    content: Buffer
}