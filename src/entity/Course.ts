import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	ManyToOne,
	ManyToMany
} from 'typeorm';
import { Faculty } from './Faculty';
import { Student } from './Student';

@Entity()
export class Course extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	coursename: string;

	@Column()
	coursecode: string;

	@Column()
	regulation: string;

	@ManyToOne(type => Faculty, faculty => faculty.courses)
	faculty: Faculty;

	@ManyToMany(type => Student, student => student.courses)
	students: Student[];
}
