
import axios from 'axios';
import { renderCorreoRegistro } from '../templates/renderCorreo';
import { renderCorreoCancelacion } from '../templates/cancelacionCorreo';
import { renderCorreoListaEspera } from '../templates/listaEsperaCorreo';
import logger from './logger';

export async function enviarCorreoRegistro(userCheck: any) {
    try {
        const html = renderCorreoRegistro(userCheck.nombreRepresentante, userCheck.nombreEvento, userCheck.fechaEvento, userCheck.horaEvento, userCheck.lugarEvento, userCheck.enlaceEvento);
        const response = await axios.post(
            process.env.MAIL_API_URL!,
            {
                CorreoDestinatario: userCheck.correoRepresentante,
                Asunto: 'Registro completado correctamente',
                MensajeTXT: 'Contratista registrado correctamente',
                MensajeHTML: html,
                NombresAdjuntos: ['confirmacion_registro.pdf'],
                ContenidosAdjuntos: [/**process.env.CONFIRMACION_PDF_BASE64**/],
            },
            {
                auth: {
                    username: process.env.MAIL_USERNAME!,
                    password: process.env.MAIL_PASSWORD!,
                },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        logger.info('Correo enviado:', response.data);
        return response.data;

    } catch (err) {
        logger.error('❌ Error al enviar correo:', err);
        throw new Error('Fallo en el envío del correo de confirmación');
    }
}

export async function enviarCorreoCancelacion(userCheck: any) {
    try {
        const html = renderCorreoCancelacion(userCheck.nombreRepresentante, userCheck.nombreEvento);
        const response = await axios.post(
            process.env.MAIL_API_URL!,
            {
                CorreoDestinatario: userCheck.correoRepresentante,
                Asunto: 'Registro cancelado',
                MensajeTXT: 'Registro cancelado correctamente',
                MensajeHTML: html,
                NombresAdjuntos: ['confirmacion_registro.pdf'],
                ContenidosAdjuntos: [/**process.env.CONFIRMACION_PDF_BASE64**/],
            },
            {
                auth: {
                    username: process.env.MAIL_USERNAME!,
                    password: process.env.MAIL_PASSWORD!,
                },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        logger.info('Correo enviado:', await response.data);
        return response.data;

    } catch (err) {
        logger.error('❌ Error al enviar correo:', err);
        throw new Error('Fallo en el envío del correo de confirmación');
    }
}

export async function enviarCorreoListaEspera(userCheck: any) {
    try {
        const html = renderCorreoListaEspera(userCheck.nombreRepresentante, userCheck.nombreEvento);
        const response = await axios.post(
            process.env.MAIL_API_URL!,
            {
                CorreoDestinatario: userCheck.correoRepresentante,
                Asunto: 'Registro en lista de espera completado correctamente',
                MensajeTXT: 'egistro en lista de espera completado correctamente',
                MensajeHTML: html,
                NombresAdjuntos: ['confirmacion_registro.pdf'],
                ContenidosAdjuntos: [/**process.env.CONFIRMACION_PDF_BASE64**/],
            },
            {
                auth: {
                    username: process.env.MAIL_USERNAME!,
                    password: process.env.MAIL_PASSWORD!,
                },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        logger.info('Correo enviado:', response.data);
        return response.data;

    } catch (err) {
        logger.error('❌ Error al enviar correo:', err);
        throw new Error('Fallo en el envío del correo de confirmación');
    }
}