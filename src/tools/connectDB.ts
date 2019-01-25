import { ApolloServer } from 'apollo-server-express';
import { createConnection } from 'typeorm';
import { env_var } from '../../Environment';
import { dbconfig } from '../config/ormconfig';
import { Admin } from '../entity/Admin';

const connectDB = async (server: ApolloServer) => {
	let retry = 10;
	while (retry !== 0) {
		try {
			await createConnection(dbconfig);
			console.log('🗄️ database connected 🗄️');
			await createAdmin();
			break;
		} catch (e) {
			retry--;
			console.log(e);
			console.log(`${retry} retries remaining`);
			await new Promise(res => setTimeout(res, 5000));
		}
	}
};

async function createAdmin() {
	const admin = await Admin.findOne({ username: env_var.ADMIN_USERNAME });
	if (!admin) {
		await Admin.delete({});
		const newadmin = await Admin.create({
			username: env_var.ADMIN_USERNAME,
			password: env_var.ADMIN_PASSWORD
		}).save();
	}
}

export { connectDB };
