import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { ELASTIC_EMAIL_API_KEY } from '../config/constants';
import logger from './logger';



/**
 * Función para enviar un correo electrónico con Elastic Email
 * @param from - Dirección de correo del remitente
 * @param to - Dirección de correo del destinatario
 * @param subject - Asunto del correo
 * @param bodyHtml - Contenido HTML del correo
 * @param attachmentPath - Ruta local del archivo adjunto
 * @param recipientName - Nombre del destinatario
 */
export async function sendEmail({
  from,
  to,
  subject,
  bodyHtml,
  attachmentPath,
  recipientName,
}: {
  from: string;
  to: string;
  subject: string;
  bodyHtml: string;
  attachmentPath?: string;
  recipientName: string;
}): Promise<void> {
  const formData = new FormData();

  // Configurar parámetros requeridos por Elastic Email
  formData.append('apikey', ELASTIC_EMAIL_API_KEY);
  formData.append('from', from);
  formData.append('to', to);
  formData.append('subject', subject);
  formData.append('bodyHtml', bodyHtml.replace('{{name}}', recipientName));

  // Adjuntar archivo si se proporciona
  if (attachmentPath) {
    formData.append('attachments', fs.createReadStream(attachmentPath), {
      filename: attachmentPath.split('/').pop(),
    });
  }

  try {
    const response = await axios.post(
      'https://api.elasticemail.com/v2/email/send',
      formData,
      { headers: { ...formData.getHeaders() } }
    );
      // logger.debug(`Correo enviado exitosamente a ${recipientName}:`, response.data);
  } catch (error) {
    const err = error as any;
      logger.error('Error al enviar el correo:', err.response?.data || err.message);
  }
}
