import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	ManyToOne,
	ManyToMany,
	JoinTable
} from 'typeorm';
import { Faculty } from './Faculty';
import { Student } from './Student';

@Entity()
export class Course extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	coursename: string;

	@Column()
	coursecode: string;

	@Column()
	regulation: number;

	@ManyToOne(type => Faculty, faculty => faculty.courses, {
		onDelete: 'CASCADE'
	})
	faculty: Faculty;

	@ManyToMany(type => Student, student => student.courses, {
		onDelete: 'CASCADE'
	})
	@JoinTable()
	students: Student[];
}
