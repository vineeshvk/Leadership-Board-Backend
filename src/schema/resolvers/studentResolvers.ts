import {
	NO_ACCESS,
	STUDENT_NOT_FOUND,
	SOMETHING_WRONG
} from '../../config/Errors';
import { Admin } from '../../entity/Admin';
import { Student } from '../../entity/Student';

const resolvers = {
	Query: {
		viewStudents
	},
	Mutation: {
		addStudent,
		deleteStudent
	}
};

//Query
async function viewStudents(_, {}) {
	try {
		const students = await Student.find({});

		return students;
	} catch (e) {
		return { errors: [SOMETHING_WRONG] };
	}
}
//Mutation
type addStudentTypes = {
	registerno: string;
	name: string;
	year: number;
	dob: string;
	section: string;
	adminId: string;
};
async function addStudent(
	_,
	{ registerno, name, year, dob, section, adminId }: addStudentTypes
) {
	try {
		const admin = await Admin.findOne({ id: adminId });
		if (!admin) return { errors: [NO_ACCESS] };

		const student = Student.create({ registerno, name, year, dob, section });
		await student.save();

		return { id: student.id };
	} catch (e) {
		return { errors: [SOMETHING_WRONG] };
	}
}

type deleteStudentArgsTypes = {
	studentId: string;
	adminId: string;
};
async function deleteStudent(
	_,
	{ studentId, adminId }: deleteStudentArgsTypes
) {
	try {
		const admin = await Admin.findOne({ id: adminId });
		if (!admin) return { errors: [NO_ACCESS] };

		const student = await Student.findOne({ id: studentId });
		if (!student) return { errors: [STUDENT_NOT_FOUND] };

		await student.remove();
		return { id: student.id };
	} catch (e) {
		return { errors: [SOMETHING_WRONG] };
	}
}

export default resolvers;
