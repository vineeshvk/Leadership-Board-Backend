import { importSchema } from 'graphql-import';
import { makeExecutableSchema } from 'graphql-tools';
import studentResolver from './resolvers/userResolvers';

const typeDefs = importSchema(`${__dirname}/typeDefs.graphql`);

const resolvers = {
	Query: { ...studentResolver.Query },
	Mutation: {
		...studentResolver.Mutation
	}
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
export default schema;
