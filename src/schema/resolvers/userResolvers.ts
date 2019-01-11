//User Resolver
import { User } from '../../entity/User';
import { hash, compare } from 'bcryptjs';
import {
	USER_EXISTS,
	USER_NOT_EXISTS,
	PASSWORD_INVALID,
} from '../../config/Errors';

const resolvers = {
	Query: {
		test
	},
	Mutation: {
		register,
		login,
	}
};

//Query
function test() {
	return 'testing';
}

//Mutation

/* ------------REGISTER--------------- */

type registerArgsType = {
	userName: string;
	password: string;
	name: string;
};

async function register(_, args: registerArgsType) {
	const userExist = await checkUserExists({ userName: args.userName });
	if (userExist) return { errors: [USER_EXISTS] };
	return await createUser(args);
}

const createUser = async ({
	userName,
	password,
	name,
}: registerArgsType) => {
	const hashedPassword = await hash(password, 10);
	const user = await User.create({
		userName,
		password: hashedPassword,
		name,
	});
	await user.save();
	return {
		id: user.id,
		name: user.name,
		userName: user.userName
	};
};

const checkUserExists = async (value: { id?: string; userName?: string }) => {
	const userExist = await User.findOne(value);
	return userExist;
};

/* ---------------LOGIN----------------- */
type loginArgsType = {
	userName: string;
	password: string;
};
async function login(_, { userName, password }: loginArgsType) {
	const user = await checkUserExists({ userName });
	if (!user) return { errors: [USER_NOT_EXISTS] };

	const validPassword = await compare(password, user.password);
	if (!validPassword) return { errors: [PASSWORD_INVALID] };

	return {
		id: user.id,
		name: user.name,
		userName: user.userName
	};
}

export default resolvers;
