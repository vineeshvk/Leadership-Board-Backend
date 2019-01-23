import { ApolloServer } from 'apollo-server';
import { createConnection } from 'typeorm';
import { dbconfig } from '../config/ormconfig';
import { Admin } from '../entity/Admin';
import schema from '../schema';

export async function startServer(port: string) {
	const server = new ApolloServer({ schema });
	let retry = 10;
	while (retry !== 0) {
		try {
			await createConnection(dbconfig);
			console.log('🗄️ database connected 🗄️');
			server
				.listen(port)
				.then(({ url }) => console.log(`☁️ connected at ${url}... ☁️`));
			createAdmin();
			break;
		} catch (e) {
			retry--;
			console.log(e);
			console.log(`${retry} retries remaining`);
			await new Promise(res => setTimeout(res, 5000));
		}
	}
}

async function createAdmin() {
	const admin = await Admin.findOne({ username: 'admin' });
	if (!admin) {
		const newadmin = await Admin.create({
			username: 'admin',
			password: 'admin'
		}).save();
	}
}
