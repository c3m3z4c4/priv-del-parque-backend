import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('rsvps')
@Unique(['userId', 'targetType', 'targetId'])
export class Rsvp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'varchar' })
  targetType: 'meeting' | 'event';

  @Column()
  targetId: string;

  @Column({ type: 'varchar' })
  status: 'attending' | 'not_attending' | 'maybe';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
