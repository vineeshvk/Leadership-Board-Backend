import { importSchema } from 'graphql-import';
import { makeExecutableSchema } from 'graphql-tools';
import studentResolver from './resolvers/studentResolvers';
import userResolver from './resolvers/facultyResolvers';
import courseResolver from './resolvers/courseResolvers';
import leadershipResolver from './resolvers/leadershipResolvers';
import adminResolver from './resolvers/adminResolvers';

const typeDefs = importSchema(`${__dirname}/typeDefs.graphql`);

const resolvers = {
	Query: {
		...studentResolver.Query,
		...userResolver.Query,
		...courseResolver.Query,
		...leadershipResolver.Query
	},
	Mutation: {
		...userResolver.Mutation,
		...courseResolver.Mutation,
		...studentResolver.Mutation,
		...leadershipResolver.Mutation,
		...adminResolver.Mutation
	}
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
export default schema;
