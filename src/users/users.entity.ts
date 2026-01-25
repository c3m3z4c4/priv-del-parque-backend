import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '../auth/roles.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.VECINO,
  })
  role: Role;

  @Column({ default: true })
  isActive: boolean;
}
