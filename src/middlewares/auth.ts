import jwt from 'jsonwebtoken';
import logger from '../lib/logger';

const SECRET_KEY = process.env.JWT_SECRET as string;

/**
 * Middleware para validar y decodificar el token JWT
 * para cada request de Apollo Server.
 * 
 * @param req - Request HTTP
 * @returns Datos extraídos del token o null si no hay token válido
 */
export const authMiddleware = async ({ req }: { req: { headers: Record<string, string>; db: unknown } }) => {
    const token = req.headers.authorization || '';

    if (!token) {
        return { usuarioId: null, rol: null, db: req.db };
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY) as { usuarioId: string | number; rol: string };
        logger.debug({
            usuarioId: decoded.usuarioId,
            rol: decoded.rol,
            db: req.db
        })
        return {
            usuarioId: decoded.usuarioId,
            rol: decoded.rol,
            db: req.db
        };
    } catch (error) {
        logger.error('Error validando token JWT:', error);
        return { usuarioId: null, rol: null, db: req.db };
    }
};
