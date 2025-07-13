import logger from '../../lib/logger';
import { verificarTokenReCaptcha } from '../../middlewares/recaptcha';

export async function validarReCaptcha(token: string) {
  try {
    const captchaValido = await verificarTokenReCaptcha(token);
    if (!captchaValido) {
      return { success: false, message: 'Fallo la verificación del reCAPTCHA. Acción rechazada.' };
    }
    return { success: true };
  } catch (err) {
    logger.error('Error validando reCAPTCHA:', err);
    return { success: false, message: 'No se pudo verificar el CAPTCHA' };
  }
}

export function manejarError(error: any, mensaje: string) {
  logger.error(mensaje, error);
  return { status: false, message: mensaje, data: null };
}
