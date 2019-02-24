import {
	NO_ACCESS,
	SOMETHING_WRONG,
	STUDENT_NOT_FOUND,
	USER_EXISTS
} from '../../config/Errors';
import { Admin } from '../../entity/Admin';
import { Student } from '../../entity/Student';
import { StudentImage } from '../../entity/StudentImage';

const resolvers = {
	Query: {
		viewStudents,
		getStudentImage
	},
	Mutation: {
		addStudent,
		deleteStudent,
		addStudentImage,
		editStudent
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
/* ------------------------ADD_STUDENT------------------------- */
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

		const studentExist = await Student.findOne({ registerno });
		if (studentExist) return { errors: [USER_EXISTS] };

		const student = Student.create({ registerno, name, year, dob, section });
		await student.save();

		return { id: student.id };
	} catch (e) {
		return { errors: [{ ...SOMETHING_WRONG, message: `${e}` }] };
	}
}

/* ------------------------DELETE_STUDENT------------------------- */

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
		return { errors: [{ ...SOMETHING_WRONG, message: `${e}` }] };
	}
}

/* ---------------------------GET_STUDENT_IMAGE------------------------------------ */

async function getStudentImage(_, { studentId }) {
	const studentImage = await StudentImage.findOne({ studentId });

	return studentImage.image;
}

/* ------------------------ADD_IMAGE_FOR_STUDENT------------------------- */

type addStudentImageArgsTypes = {
	adminId: string;
	studentId: string;
	image: string;
};
async function addStudentImage(
	_,
	{ adminId, studentId, image }: addStudentImageArgsTypes
) {
	try {
		const admin = await Admin.findOne({ id: adminId });
		if (!admin) return { errors: [NO_ACCESS] };

		const student = await Student.findOne({ id: studentId });
		if (!student) return { errors: [STUDENT_NOT_FOUND] };

		const studentImage = StudentImage.create({ image, studentId: student.id });
		await studentImage.save();

		return { id: student.id };
	} catch (e) {
		return { errors: [{ ...SOMETHING_WRONG, message: `${e}` }] };
	}
}

/* ------------------------EDIT_STUDENT------------------------- */
type editStudentArgsTypes = {
	adminId: string;
	studentId: string;
	registerno?: string;
	name?: string;
	dob?: string;
	year?: number;
	section?: string;
};
async function editStudent(
	_,
	{
		adminId,
		studentId,
		registerno,
		name,
		dob,
		year,
		section
	}: editStudentArgsTypes
) {
	try {
		const admin = await Admin.findOne({ id: adminId });
		if (!admin) return { errors: [NO_ACCESS] };

		const student = await Student.findOne({ id: studentId });
		if (!student) return { errors: [STUDENT_NOT_FOUND] };

		if (registerno) student.registerno = registerno;
		if (name) student.name = name;
		if (dob) student.dob = dob;
		if (year) student.year = year;
		if (section) student.section = section;

		await student.save();
		return { id: student.id };
	} catch (e) {
		return { errors: [{ ...SOMETHING_WRONG, message: `{e}` }] };
	}
}

export default resolvers;
