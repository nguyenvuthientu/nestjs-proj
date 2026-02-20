import { Expose } from 'class-transformer';
import { Task } from 'src/tasks/task.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column()
  @Expose()
  name: string;

  @Column()
  @Expose()
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  @Expose()
  createAt: Date;

  @UpdateDateColumn()
  @Expose()
  updateAt: Date;

  @OneToMany(() => Task, (task) => task.user)
  @Expose()
  tasks: Task[];

  @Column('text', { array: true, default: [Role.USER] })
  @Expose()
  roles: Role[];
}
