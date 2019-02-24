import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn
} from 'typeorm';
import { Course } from './Course';
import { Faculty } from './Faculty';
import { Student } from './Student';

@Entity()
export class LeadershipRecord extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(type => Course, { onDelete: 'CASCADE' })
	@JoinColumn()
	course: Course;

	@ManyToOne(type => Faculty, { onDelete: 'CASCADE' })
	@JoinColumn()
	faculty: Faculty;

	@ManyToOne(type => Student, { onDelete: 'CASCADE' })
	@JoinColumn()
	student: Student;

	@Column()
	date: string;

	@Column()
	points: number;
}
