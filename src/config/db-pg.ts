import pgPromise from 'pg-promise';
// postgres

export const connectionString = process.env.DB ?? '';

const pgp = pgPromise({}); // empty pgPromise instance

export const ps = pgp(connectionString);
