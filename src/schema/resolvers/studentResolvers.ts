import { NO_ACCESS } from '../../config/Errors';
import { Admin } from '../../entity/Admin';
import { Student } from '../../entity/Student';

const resolvers = {
	Query: {
		viewStudents
	},
	Mutation: {
		addStudent
	}
};

//Query
async function viewStudents(_, {}) {
	const students = await Student.find({});

	return students;
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
	const admin = await Admin.findOne({ id: adminId });
	if (!admin) return { errors: [NO_ACCESS] };

	const student = Student.create({ registerno, name, year, dob, section });
	await student.save();

	return { id: student.id };
}

export default resolvers;
