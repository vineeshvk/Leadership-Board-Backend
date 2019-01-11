import { ApolloServer } from 'apollo-server';
import { createConnection } from 'typeorm';
import schema from '../schema';
import { dbconfig } from '../config/ormconfig';

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
			break;
		} catch (e) {
			retry--;
			console.log(e);
			console.log(`${retry} retries remaining`);
			await new Promise(res => setTimeout(res, 5000));
		}
	}
}
