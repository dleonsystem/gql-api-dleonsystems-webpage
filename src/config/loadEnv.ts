import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from project root .env file
const env = dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

export default env;
