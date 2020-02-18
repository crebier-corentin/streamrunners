/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserEntity } from '../user/user.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('coupon')
export class CouponEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ unique: true })
    public name: string;

    @Column()
    public amount: number;

    @Column()
    public max: number;

    @Column('datetime')
    public expires: Date;

    @ManyToMany(
        type => UserEntity,
        user => user.coupons,
        { cascade: true }
    )
    public users: UserEntity[];

    public isValid(): boolean {
        //Is not expired and used less than max
        return this.expires > new Date() && this.users.length < this.max;
    }
}
