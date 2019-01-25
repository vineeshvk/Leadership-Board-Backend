import { getRepository } from 'typeorm';
import { COURSE_NOT_FOUND, FACULTY_NOT_FOUND, SOMETHING_WRONG, STUDENT_NOT_FOUND } from '../../config/Errors';
import { Course } from '../../entity/Course';
import { Faculty } from '../../entity/Faculty';
import { LeadershipRecord } from '../../entity/LeadershipRecord';
import { Student } from '../../entity/Student';

const resolvers = {
	Query: { viewRecords,viewRecordsCSV:viewRecords },
	Mutation: { addRecord }
};
//Query
async function viewRecords(_, { csv, date, coursename, facultyId }) {
	try {
		const recordRepo = await getRepository(LeadershipRecord)
			.createQueryBuilder('records')
			.leftJoinAndSelect('records.faculty', 'faculty')
			.leftJoinAndSelect('records.course', 'course')
			.leftJoinAndSelect('records.student', 'student')
			.getMany();

		let records = recordRepo;
		if (facultyId) {
			records = records.filter(record => record.faculty.id === facultyId);
		}
		if (date) {
			records = records.filter(record => record.date === date);
		}
		if (coursename) {
			records = records.filter(
				record => record.course.coursename === coursename
			);
		}

		if (csv) {
			let allRecords: string =
				'Date,CourseCode,CourseName,FacultyName,RegisterNumber,StudentName,Points';

			records.forEach(record => {
				allRecords += `\n${record.date},${record.course.coursecode},${
					record.course.coursename
				},${record.faculty.name},${record.student.registerno},${
					record.student.name
				},${record.points}`;
			});

			return { csv: allRecords };
		}

		return { records };
	} catch (e) {
		return { errors: [{ ...SOMETHING_WRONG, message: `${e}` }] };
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
		return { errors: [{ ...SOMETHING_WRONG, message: `${e}` }] };
	}
}

export default resolvers;
