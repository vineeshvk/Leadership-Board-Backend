import { ConnectionOptions } from 'typeorm';
import { Faculty } from '../entity/Faculty';
import { Course } from '../entity/Course';
import { Student } from '../entity/Student';
import { Admin } from '../entity/Admin';

const docker = {
	host: 'postgres',
	port: 5432,
	username: 'postgres',
	password: '12345',
	database: 'leadershipBoard'
};

const dev = {
	host: 'localhost',
	port: 5432,
	username: 'vineesh',
	password: '1234',
	database: 'leadershipBoard'
};

const deploy = {
	url: process.env.DATABASE_URL,
	extra: { ssl: true }
};

const config = process.env.DATABASE_URL ? deploy : docker;

export const dbconfig: ConnectionOptions = {
	...config,
	type: 'postgres',
	synchronize: true,
	logging: false,
	entities: [Faculty,Course,Student,Admin],
	dropSchema:false,
	migrations: ['src/migration/**/*.ts'],
	subscribers: ['src/subscriber/**/*.ts'],
	cli: {
		entitiesDir: '../entity',
		migrationsDir: 'src/migration',
		subscribersDir: 'src/subscriber'
	}
};
