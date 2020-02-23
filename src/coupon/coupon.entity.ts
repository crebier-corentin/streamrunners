/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../user/user.entity';

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

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    public isValid(): boolean {
        //Is not expired and used less than max
        return this.expires > new Date() && this.users.length < this.max;
    }
}
