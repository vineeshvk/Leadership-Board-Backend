import { Admin } from '../../entity/Admin';
import { ADMIN_NOT_EXISTS, PASSWORD_INVALID } from '../../config/Errors';

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
	const admin = await Admin.findOne({ username });

	if (!admin) return { errors: [ADMIN_NOT_EXISTS] };

	if (admin.password !== password) return { errors: [PASSWORD_INVALID] };

	return { id: admin.id };
}
export default resolvers;
