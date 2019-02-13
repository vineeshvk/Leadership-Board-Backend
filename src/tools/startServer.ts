import { ApolloServer } from 'apollo-server-express';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import schema from '../schema';
import { connectDB } from './connectDB';
import serveStatic = require('serve-static');

export async function startServer(port: string) {
	const server = new ApolloServer({ schema });
	const app = express();

	await connectDB(server);
	app.use(bodyParser({ limit: '10mb' }));
	server.applyMiddleware({ app, path: '/graphql' });
	app.use(serveStatic(path.join('/usr/src/app', '/dist/')));

	app.get('*', (req, res) => {
		res.sendFile('/usr/src/app' + '/dist/index.html');
	});

	app.listen({ port: process.env.PORT || port }, () => {
		console.log(`☁️ server connected ☁️`);
	});
}
