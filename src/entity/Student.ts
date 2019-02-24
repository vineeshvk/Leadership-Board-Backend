import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Course } from './Course';
import { StudentTotalMarks } from './StudentTotalMarks';

@Entity()
export class Student extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  registerno: string;

  @Column()
  name: string;

  @Column()
  dob: string;

  @Column()
  year: number;

  @Column()
  section: string;

  @ManyToMany(type => Course, course => course.students)
  courses: Course[];

  @OneToOne(type => StudentTotalMarks)
  @JoinColumn()
  totalMarks: StudentTotalMarks;

  @Column({ nullable: true })
  isSow: boolean;
}
