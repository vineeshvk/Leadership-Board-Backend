import { Student } from '../../entity/Student';
import { Course } from '../../entity/Course';
import { Admin } from '../../entity/Admin';
import { Faculty } from '../../entity/Faculty';
import { getRepository } from 'typeorm';

const resolvers = {
	Query: {
		viewCourses
	},
	Mutation: {
		addCourse
	}
};

//Queries
/* -------------------VIEW_COURSES----------------------------- */
async function viewCourses(_, {}) {
	const courses = await getRepository(Course)
		.createQueryBuilder('course')
		.leftJoinAndSelect('course.faculty', 'faculty')
		.leftJoinAndSelect('course.students', 'students')
		.getMany();
	return courses;
}
//Mutations
/* --------------------ADD_COURSE-------------------------- */
type addCourseArgTypes = {
	coursename: string;
	coursecode: string;
	regulation: number;
	adminId: string;
	studentsId: string[];
	facultyId: string;
};
async function addCourse(
	_,
	{
		coursename,
		coursecode,
		regulation,
		adminId,
		studentsId,
		facultyId
	}: addCourseArgTypes
) {
	const admin = await Admin.findOne({ id: adminId });
	if (!admin) return null;

	const students = await getAllStudents(studentsId);
	const faculty = await Faculty.findOne({ id: facultyId });

	const course = Course.create({
		coursename,
		coursecode,
		regulation,
		faculty,
		students
	});
	await course.save();
}

const getAllStudents = async (studentsId: string[]) => {
	const students = await Promise.all(
		studentsId.map(async studentId => {
			const user = await Student.findOne({ id: studentId });
			return user;
		})
	);
	return students;
};

export default resolvers;
