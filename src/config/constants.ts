import environments from './environments';

if (process.env.NODE_ENV !== 'production') {
    const environment = environments;
}
export const ELASTIC_EMAIL_API_KEY = process.env.ELASTIC_EMAIL_API_KEY ?? ''; // Coloca tu API Key aquí
export const SECRET_KEY = process.env.SECRET ?? '';
export const HOSTMYSQL= process.env.HOSTMYSQL ?? 'localhost';
export const USERMYSQL= process.env.USERMYSQL ?? 'root';
export const PASSWORDMYSQL= process.env.PASSWORDMYSQL ?? '';
export const DBMYSQL= process.env.DBMYSQL ?? 'developers';
export const PORT = process.env.PORT ?? 3000;
export const USRAPI = process.env.USRAPI ?? 'api';
export const PASSWORDAPI = process.env.PASSWORDAPI ?? '';
export const DURACIONTOKEN = process.env.DURACIONTOKEN ?? 3600;
