import * as dotenv from 'dotenv';
import { startServer } from './tools/startServer';

dotenv.config();

startServer(process.env.PORT || '5430');
