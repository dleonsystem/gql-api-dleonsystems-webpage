import dotenv from 'dotenv';
import path from 'path';

const environments = dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

// Ignore missing .env file in non-production environments

export default environments;
