import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity('houses')
export class House {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  houseNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: 'active' | 'inactive';

  @OneToMany(() => User, (user) => user.house)
  residents: User[];

  @CreateDateColumn()
  createdAt: Date;
}
