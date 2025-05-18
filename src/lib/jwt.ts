// Importación de claves y duración del token desde configuración
import { DURACIONTOKEN, SECRET_KEY } from '../config/constants';
import jwt from 'jsonwebtoken';

/**
 * Clase para la generación y validación de tokens JWT
 */
class JWT {
    // Clave secreta para firmar/verificar el token
    private secretKey = SECRET_KEY as string;

    /**
     * Genera un token JWT válido por el tiempo definido en la configuración
     *
     * @param data - Objeto con información del usuario (se espera que incluya "user")
     * @returns Token JWT como string
     */
    sign(data: any): string {
        return jwt.sign(
            { user: data.user },           // Payload
            this.secretKey,                // Clave secreta
            { expiresIn: Number(DURACIONTOKEN) } // Duración del token en segundos
        );
    }

    /**
     * Verifica si un token JWT es válido.
     * Si no lo es, devuelve un mensaje de error personalizado.
     *
     * @param token - El token JWT a verificar
     * @returns El payload decodificado o un mensaje de error si no es válido
     */
    verify(token: string): string {
        try {
            return jwt.verify(token, this.secretKey) as string;
        } catch (e) {
            return 'La autenticación del token es inválida. Por favor, inicia sesión para obtener un nuevo token';
        }
    }
}

export default JWT;
