import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/users.entity';
import { House } from '../houses/houses.entity';

@Entity('dues_payments')
@Unique(['userId', 'month', 'year'])
export class DuesPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  houseId: string | null;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['paid', 'pending', 'exempt'],
    default: 'pending',
  })
  status: 'paid' | 'pending' | 'exempt';

  @Column({ type: 'date', nullable: true })
  paidAt: string | null;

  @Column({ type: 'varchar', nullable: true })
  notes: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => House, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'houseId' })
  house: House;

  @CreateDateColumn()
  createdAt: Date;
}
