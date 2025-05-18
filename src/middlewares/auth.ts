import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro';

/**
 * Middleware para validar y decodificar el token JWT
 * para cada request de Apollo Server.
 * 
 * @param req - Request HTTP
 * @returns Datos extraídos del token o null si no hay token válido
 */
export const authMiddleware = async ({ req }: { req: any }) => {
    const token = req.headers.authorization || '';

    if (!token) {
        return { usuarioId: null, rol: null, db: req.db };
    }

    try {
        const decoded: any = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
        console.log({
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
        console.error('Error validando token JWT:', error);
        return { usuarioId: null, rol: null, db: req.db };
    }
};
