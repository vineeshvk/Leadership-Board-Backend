import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class StudentTotalMarks extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ default: 0 })
	totalMarks: number;
}
