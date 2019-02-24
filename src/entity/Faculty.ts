import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	OneToMany
} from 'typeorm';
import { Course } from './Course';

@Entity()
export class Faculty extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	username: string;

	@Column()
	password: string;

	@Column()
	name: string;

	@OneToMany(type => Course, course => course.faculty)
	courses: Course[];
}
