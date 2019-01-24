import { getRepository } from 'typeorm';
import {
	COURSE_NOT_FOUND,
	FACULTY_NOT_FOUND,
	STUDENT_NOT_FOUND,
	SOMETHING_WRONG
} from '../../config/Errors';
import { Course } from '../../entity/Course';
import { Faculty } from '../../entity/Faculty';
import { LeadershipRecord } from '../../entity/LeadershipRecord';
import { Student } from '../../entity/Student';

const resolvers = {
	Query: { viewRecords },
	Mutation: { addRecord }
};
//Query
async function viewRecords(_, { csv }) {
	try {
		const records = await getRepository(LeadershipRecord)
			.createQueryBuilder('records')
			.leftJoinAndSelect('records.faculty', 'faculty')
			.leftJoinAndSelect('records.course', 'course')
			.leftJoinAndSelect('records.student', 'student')
			.getMany();

		if (csv) {
			let allRecords: string =
				'Date,CourseCode,CourseName,RegisterNumber,Name,Points';

			records.forEach(record => {
				allRecords += `${record.date},${record.course.coursecode},${
					record.course.coursename
				},${record.student.registerno},${record.faculty.name},${
					record.points
				}\n`;
			});

			return { csv: allRecords };
		}

		return { records };
	} catch (e) {
		return { errors: [SOMETHING_WRONG] };
	}
}

//Mutation
/* ----------------------ADD_RECORD------------------------- */
type addRecordArgTypes = {
	courseId: string;
	facultyId: string;
	studentId: string;
	points: number;
	date: string;
};
async function addRecord(
	_,
	{ courseId, facultyId, studentId, points, date }: addRecordArgTypes
) {
	try {
		const course = await Course.findOne({ id: courseId });
		if (!course) return { errors: [COURSE_NOT_FOUND] };

		const faculty = await Faculty.findOne({ id: facultyId });
		if (!faculty) return { errors: [FACULTY_NOT_FOUND] };

		const student = await Student.findOne({ id: studentId });
		if (!student) return { errors: [STUDENT_NOT_FOUND] };

		const record = LeadershipRecord.create({
			date,
			student,
			faculty,
			course,
			points
		});

		await record.save();

		return { id: record.id };
	} catch (e) {
		return { errors: [SOMETHING_WRONG] };
	}
}

export default resolvers;
