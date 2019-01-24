import { getRepository } from 'typeorm';
import {
	COURSE_NOT_FOUND,
	FACULTY_NOT_FOUND,
	NO_ACCESS,
	SOMETHING_WRONG,
	STUDENT_NOT_FOUND
} from '../../config/Errors';
import { Admin } from '../../entity/Admin';
import { Course } from '../../entity/Course';
import { Faculty } from '../../entity/Faculty';
import { Student } from '../../entity/Student';

const resolvers = {
	Query: {
		viewCourses
	},
	Mutation: {
		addCourse,
		deleteCourse
	}
};

//Queries
/* -------------------VIEW_COURSES----------------------------- */
async function viewCourses(_, { facultyId }: { facultyId: string }) {
	try {
		const courses = await getRepository(Course)
			.createQueryBuilder('course')
			.leftJoinAndSelect('course.faculty', 'faculty')
			.leftJoinAndSelect('course.students', 'students')
			.getMany();

		if (facultyId) {
			return courses.filter(course => course.faculty.id === facultyId);
		}
		return courses;
	} catch (e) {
		return { errors: [SOMETHING_WRONG] };
	}
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
	try {
		const admin = await Admin.findOne({ id: adminId });
		if (!admin) return { errors: [NO_ACCESS] };

		const students = await getAllStudents(studentsId);
		if (!students) return { errors: [STUDENT_NOT_FOUND] };

		const faculty = await Faculty.findOne({ id: facultyId });
		if (!faculty) return { errors: [FACULTY_NOT_FOUND] };

		const course = Course.create({
			coursename,
			coursecode,
			regulation,
			faculty,
			students
		});
		await course.save();
		return { id: course.id };
	} catch (e) {
		return { errors: [SOMETHING_WRONG] };
	}
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

/* ---------------------DELETE_COURSE---------------------------- */
type deleteCourseArgsTypes = {
	courseId: string;
	adminId: string;
};
async function deleteCourse(_, { courseId, adminId }: deleteCourseArgsTypes) {
	try {
		const admin = await Admin.findOne({ id: adminId });
		if (!admin) return { errors: [NO_ACCESS] };

		const course = await Course.findOne({ id: courseId });
		if (!course) return { errors: [COURSE_NOT_FOUND] };

		await course.remove();
		return { id: course.id };
	} catch (e) {
		return { errors: [SOMETHING_WRONG] };
	}
}

export default resolvers;
