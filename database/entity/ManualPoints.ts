import {BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Repository} from "typeorm";
import {User} from "./User";

@Entity()
export class ManualPoints extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    amount: number;

    @ManyToOne(type => User, user => user.manualPoints, {onDelete: "CASCADE"})
    user: User;

    @CreateDateColumn()
    createdAt: Date;




}


