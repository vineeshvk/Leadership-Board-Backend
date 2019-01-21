import { importSchema } from 'graphql-import';
import { makeExecutableSchema } from 'graphql-tools';
import studentResolver from './resolvers/studentResolvers';
import userResolver from './resolvers/facultyResolvers';
import courseResolver from './resolvers/courseResolvers';

const typeDefs = importSchema(`${__dirname}/typeDefs.graphql`);

const resolvers = {
	Query: {
		...studentResolver.Query,
		...userResolver.Query,
		...courseResolver.Query
	},
	Mutation: {
		...userResolver.Mutation,
		...courseResolver.Mutation,
		...studentResolver.Mutation
	}
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
export default schema;
