/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserEntity } from '../user/user.entity';
import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('coupon')
export class CouponEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column()
    amount: number;

    @Column()
    max: number;

    @Column('datetime')
    expires: Date;

    @ManyToMany(
        type => UserEntity,
        user => user.coupons,
        { cascade: true }
    )
    users: UserEntity[];

    isValid(): boolean {
        //Is not expired and used less than max
        return this.expires > new Date() && this.users.length < this.max;
    }
}
