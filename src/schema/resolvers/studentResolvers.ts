import { Student } from '../../entity/Student';
import { Admin } from '../../entity/Admin';

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
	if (!admin) {
		return null;
	}

	const student = Student.create({ registerno, name, year, dob, section });
	await student.save();

	return student.id;
}

export default resolvers;
