//User Resolver
import { Faculty } from '../../entity/Faculty';
import { hash, compare } from 'bcryptjs';
import {
	USER_EXISTS,
	USER_NOT_EXISTS,
	PASSWORD_INVALID
} from '../../config/Errors';

const resolvers = {
	Query: {
		test,
		viewFaculties
	},
	Mutation: {
		register,
		login
	}
};

//Query
function test() {
	return 'testing';
}

async function viewFaculties(_, {}) {
	const faculties = await Faculty.find({});
	return faculties;
}

//Mutation

/* ------------REGISTER--------------- */

type registerArgsType = {
	username: string;
	password: string;
	name: string;
};

async function register(_, args: registerArgsType) {
	const userExist = await checkUserExists({ username: args.username });
	if (userExist) return { errors: [USER_EXISTS] };
	return await createUser(args);
}

const createUser = async ({ username, password, name }: registerArgsType) => {
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
type loginArgsType = {
	username: string;
	password: string;
};
async function login(_, { username, password }: loginArgsType) {
	const user = await checkUserExists({ username });
	if (!user) return { errors: [USER_NOT_EXISTS] };

	const validPassword = await compare(password, user.password);
	if (!validPassword) return { errors: [PASSWORD_INVALID] };

	return {
		id: user.id,
		name: user.name,
		username: user.username
	};
}

export default resolvers;
