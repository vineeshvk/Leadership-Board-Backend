import { ApolloServer } from 'apollo-server-express';
import { createConnection } from 'typeorm';
import { dbconfig } from '../config/ormconfig';
import { Admin } from '../entity/Admin';
import { hash } from 'bcryptjs';

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
	const admin = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
	if (!admin) {
		const hashedPassword = await hash(process.env.ADMIN_PASSWORD, 10);
		await Admin.delete({});
		const newadmin = await Admin.create({
			username: process.env.ADMIN_USERNAME,
			password: hashedPassword
		}).save();
	}
}

export { connectDB };
