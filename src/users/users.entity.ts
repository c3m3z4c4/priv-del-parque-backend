import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from '../auth/roles.enum';
import { House } from '../houses/houses.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.VECINO,
  })
  role: Role;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => House, (house) => house.residents, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'houseId' })
  house: House;

  @Column({ nullable: true })
  houseId: string;

  @CreateDateColumn()
  createdAt: Date;
}
