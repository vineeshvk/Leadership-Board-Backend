//User Resolver
import { compare, hash } from 'bcryptjs';
import {
	FACULTY_NOT_FOUND,
	NO_ACCESS,
	PASSWORD_INVALID,
	SOMETHING_WRONG,
	USER_EXISTS,
	USER_NOT_EXISTS
} from '../../config/Errors';
import { Admin } from '../../entity/Admin';
import { Faculty } from '../../entity/Faculty';

const resolvers = {
	Query: {
		test,
		viewFaculties
	},
	Mutation: {
		addFaculty,
		facultyLogin,
		deleteFaculty
	}
};

//Query
function test() {
	return 'testing';
}

async function viewFaculties(_, {}) {
	try {
		const faculties = await Faculty.find({});
		return faculties;
	} catch (e) {
		return { errors: [SOMETHING_WRONG] };
	}
}

//Mutation

/* ------------REGISTER--------------- */

type addFacultyArgsType = {
	username: string;
	password: string;
	name: string;
};

async function addFaculty(_, args: addFacultyArgsType) {
	try {
		const userExist = await checkUserExists({ username: args.username });
		if (userExist) return { errors: [USER_EXISTS] };
		return await createUser(args);
	} catch (e) {
		return { errors: [SOMETHING_WRONG] };
	}
}

const createUser = async ({ username, password, name }: addFacultyArgsType) => {
	const hashedPassword = await hash(password, 10);
	const user = await Faculty.create({
		username,
		password: hashedPassword,
		name
	});
	await user.save();
	return {
		id: user.id,
		name: user.name,
		username: user.username
	};
};

const checkUserExists = async (value: { id?: string; username?: string }) => {
	const userExist = await Faculty.findOne(value);
	return userExist;
};

/* ---------------LOGIN----------------- */
type facultyLoginArgsType = {
	username: string;
	password: string;
};
async function facultyLogin(_, { username, password }: facultyLoginArgsType) {
	try {
		const user = await checkUserExists({ username });
		if (!user) return { errors: [USER_NOT_EXISTS] };

		const validPassword = await compare(password, user.password);
		if (!validPassword) return { errors: [PASSWORD_INVALID] };

		return {
			id: user.id,
			name: user.name,
			username: user.username
		};
	} catch (e) {
		return { errors: [SOMETHING_WRONG] };
	}
}

/* ---------------DELETE_FACULTY--------------------- */

type deleteFacultyArgsTypes = {
	facultyId: string;
	adminId: string;
};
async function deleteFaculty(
	_,
	{ facultyId, adminId }: deleteFacultyArgsTypes
) {
	try {
		const admin = await Admin.findOne({ id: adminId });
		if (!admin) return { errors: [NO_ACCESS] };

		const faculty = await Faculty.findOne({ id: facultyId });
		if (!faculty) return { errors: [FACULTY_NOT_FOUND] };

		await faculty.remove();
		return { id: faculty.id };
	} catch (e) {
		return { errors: [SOMETHING_WRONG] };
	}
}
export default resolvers;
