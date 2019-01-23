import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	ManyToOne,
	ManyToMany,
	JoinTable
} from 'typeorm';
import { Course } from './Course';

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
}
