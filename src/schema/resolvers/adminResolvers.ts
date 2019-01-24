import {
	ADMIN_NOT_EXISTS,
	PASSWORD_INVALID,
	SOMETHING_WRONG
} from '../../config/Errors';
import { Admin } from '../../entity/Admin';

const resolvers = {
	Query: {},
	Mutation: {
		adminLogin
	}
};

//Mutation
/* -----------------ADMIN_LOGIN---------------------- */
type adminLoginArgsType = {
	username: string;
	password: string;
};
async function adminLogin(_, { username, password }: adminLoginArgsType) {
	try {
		const admin = await Admin.findOne({ username });

		if (!admin) return { errors: [ADMIN_NOT_EXISTS] };

		if (admin.password !== password) return { errors: [PASSWORD_INVALID] };

		return { id: admin.id };
	} catch (e) {
		return { errors: [SOMETHING_WRONG] };
	}
}
export default resolvers;
