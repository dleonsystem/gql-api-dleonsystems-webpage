import logger from '../../lib/logger';
import { enviarCorreoCancelacion, enviarCorreoListaEspera, enviarCorreoRegistro } from '../../lib/enviarCorreo';
import { renderCorreoRegistro } from '../../templates/renderCorreo';
import { validarReCaptcha, manejarError } from './helpers';

export const eventMutations = {
  async crearRegistro(_: void, args: { input: any }, { ps, recaptchaToken, token }: { ps: any; recaptchaToken: string; token: string }): Promise<any> {
    try {
      const captcha = await validarReCaptcha(recaptchaToken);
      if (!captcha.success) {
        return { status: false, message: captcha.message, data: null };
      }
    } catch (err) {
      logger.error('Error validando reCAPTCHA:', err);
      return manejarError(err, 'No se pudo verificar el CAPTCHA');
    }

    const {
      eventoId, usuarioId, nombre, apellidoPaterno, apellidoMaterno,
      correoElectronico, telefono, curp, sector, nivelEducativo,
      subsistema, giroEmpresa, tamanioEmpresa, ubicacionesEmpresa,
      nivelOperacionEmpresa, modeloDual, numEstudiantesDual,
      anosExperiencia, entidadFederativa, municipio,
    } = args.input;
    try {
      const config = await ps.oneOrNone(
        `SELECT "OID" as id, "Valor" as valor FROM "Configuracion" WHERE "Activo" AND "OID" = 1`
      );
      if (!config) {
        return { status: false, message: 'No se encontraron configuraciones activas' };
      }

      const requiereRegistro = config.valor !== 'false';

      if (!usuarioId) {
        const usuarioExistente = await ps.oneOrNone(
          `SELECT "Oid" as id, "CorreoElectronico" as correoElectronico, "Telefono" as telefono, "Nombre" as nombre,
                        "ApellidoPaterno" as apellidoPaterno, "ApellidoMaterno" as apellidoMaterno
         FROM "Usuario" WHERE "CorreoElectronico" = $1 AND "Telefono" = $2`,
          [correoElectronico, telefono]
        );

        if (usuarioExistente) {
          usuarioId = usuarioExistente.id;
          ({ correoElectronico, telefono, nombre, apellidoPaterno, apellidoMaterno } = usuarioExistente);
        } else if (!requiereRegistro) {
          const nuevoUsuario = await ps.one(
            `INSERT INTO "Usuario" ("Oid", "Nombre", "ApellidoPaterno", "ApellidoMaterno", "CorreoElectronico", "Telefono", "CURP", "Rol", "FechaRegistro", "OptimisticLockField")
           VALUES (gen_random_uuid(), TRIM($1), TRIM($2), TRIM($3), TRIM($4), TRIM($5), TRIM($6), 'Usuario', NOW(), 1)
           RETURNING "Oid" as id, "Nombre", "ApellidoPaterno", "ApellidoMaterno", "CorreoElectronico", "Telefono"`,
            [nombre, apellidoPaterno, apellidoMaterno, correoElectronico, telefono, curp]
          );
          usuarioId = nuevoUsuario.id;
        } else {
          return { status: false, message: 'Se requiere inicio de sesión para registrarse en el evento' };
        }
      }
      const usuario = await ps.oneOrNone(
        `SELECT "Oid" as id, "Nombre" as nombre, "ApellidoPaterno" as "apellidoPaterno", "ApellidoMaterno" as "apellidoMaterno",
            "CorreoElectronico" as "correoElectronico", "Telefono" as "telefono", "CURP" as curp, "Sexo" as sexo,
            TO_CHAR("FechaNacimiento", 'YYYY-MM-DD') as "fechaNacimiento"
            FROM "Usuario" WHERE "Oid" = $1`,
        [usuarioId]
      );

      const yaRegistrado = await ps.oneOrNone(
        `SELECT "Oid" FROM "RegistroEvento" WHERE "Usuario" = $1 AND "Evento" = $2 AND "GCRecord" IS NULL AND "Cancelado" IS NOT TRUE`,
        [usuarioId, eventoId]
      );
      if (yaRegistrado) {
        return { status: false, message: 'El usuario ya está registrado en este evento', registros: null };
      }

      const evento = await ps.oneOrNone(
        `SELECT "Oid" as id, "CapacidadMaxima" as "capacidadMaxima", "Nombre" as nombre, TO_CHAR("Fecha", 'YYYY-MM-DD') as fecha, "Hora" as hora, "Lugar" as lugar
                     FROM "Evento"
       WHERE "Oid" = $1 AND "GCRecord" IS NULL AND "Estado" IN ('Activo', 'Programado')`,
        [eventoId]
      );
      if (!evento) {
        return { status: false, message: 'El evento no está activo o no existe', registros: null };
      }

      const inscritos = await ps.oneOrNone(
        `SELECT COUNT(*) as inscritos FROM "RegistroEvento"
       WHERE "Evento" = $1 AND "GCRecord" IS NULL AND "Cancelado" IS NOT TRUE`,
        [eventoId]
      );
      if (parseInt(inscritos.inscritos, 10) >= parseInt(evento.capacidadMaxima, 10)) {
        return { status: false, message: 'No hay cupo disponible para este evento', registros: null };
      }

      const registro = await ps.one(
        `INSERT INTO "RegistroEvento" (
        "Oid", "Usuario", "Evento", "FechaRegistro", "Confirmado", "Cancelado",
        "Sector", "NivelEducativo", "Subsistema", "GiroEmpresa", "TamanioEmpresa",
        "UbicacionesEmpresa", "NivelOperacionEmpresa", "ModeloDual", "NumEstudiantesDual",
        "AnosExperiencia", "EntidadFederativa", "Municipio"
      ) VALUES (
        gen_random_uuid(), $1, $2, NOW(), false, false,
        TRIM($3), TRIM($4), TRIM($5), TRIM($6), TRIM($7),
        TRIM($8), TRIM($9), $10, $11,
        $12, TRIM($13), TRIM($14)
      ) RETURNING "Oid" as id, "Usuario" as "usuarioId", "Evento" as "eventoId", TO_CHAR("FechaRegistro", 'YYYY-MM-DD') as "fechaRegistro", "Confirmado" as confirmado, "Cancelado" as cancelado,
        "Sector" as sector, "NivelEducativo" as nivelEducativo, "Subsistema" as subsistema,
        "GiroEmpresa" as giroEmpresa, "TamanioEmpresa" as tamanioEmpresa,
        "UbicacionesEmpresa" as ubicacionesEmpresa, "NivelOperacionEmpresa" as nivelOperacionEmpresa,
        "ModeloDual" as modeloDual, "NumEstudiantesDual" as numEstudiantesDual,
        "AnosExperiencia" as anosExperiencia, "EntidadFederativa" as entidadFederativa,
        "Municipio" as municipio
      ;`,
        [
          usuarioId, eventoId,
          sector, nivelEducativo, subsistema, giroEmpresa, tamanioEmpresa,
          Array.isArray(ubicacionesEmpresa) ? ubicacionesEmpresa.map(u => u.trim()).join(', ') : null,
          nivelOperacionEmpresa, modeloDual, numEstudiantesDual,
          anosExperiencia, entidadFederativa, municipio,
        ]
      );
      try {
        enviarCorreoRegistro({
          nombreRepresentante: `${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`,
          correoRepresentante: usuario.correoElectronico,
          nombreEvento: evento.nombre,
          fechaEvento: evento.fecha,
          horaEvento: evento.hora,
          lugarEvento: evento.lugar,
          enlaceEvento: `http://qa.cerrarlabrecha.sep.gob.mx/eventos/${eventoId}`,
        });
      } catch (error) {
        logger.error('Error al enviar correo de confirmación:', error);
        return manejarError(error, 'Error al enviar correo de confirmación');
      }

      return { status: true, message: 'El se registró correctamente al evento', registros: [registro] };
    } catch (error) {
      logger.error('❌ Error al crear registro:', error);
      return manejarError(error, 'Error al crear registro');
    }
  },

  async cancelarRegistro(_: void, { registroId, motivo }: { registroId: string; motivo: string }, { ps, recaptchaToken }: { ps: any; recaptchaToken: string }): Promise<any> {
    try {
      const registroExistente = await ps.oneOrNone(
        `SELECT "Oid" as id FROM "RegistroEvento" WHERE "Oid" = $1 AND "GCRecord" IS NULL AND "Cancelado" = false`,
        [registroId]
      );
      if (!registroExistente) {
        return { status: false, message: 'El registro no existe o ya ha sido cancelado', cancelacion: null };
      }
      const cancelacion = await ps.oneOrNone(
        `UPDATE "RegistroEvento" SET "Cancelado" = true WHERE "Oid" = $1 AND "GCRecord" IS NULL
                    RETURNING "Oid" as id, "Evento" as "eventoId", "Usuario" as "usuarioId", "FechaRegistro" as "fechaRegistro", "Confirmado" as confirmado, "Cancelado" as cancelado ;`,
        [registroId]
      );
      const registro = await ps.one(
        `INSERT INTO "CancelacionRegistro"
         ("Oid", "RegistroEvento", "FechaCancelacion", "Motivo", "CanceladoPor", "OptimisticLockField")
         VALUES (gen_random_uuid(), $1, NOW(), $2, 'Usuario', 1)
         RETURNING "Oid" as id, "RegistroEvento" as registroId, TO_CHAR("FechaCancelacion", 'YYYY-MM-DD') as "fechaCancelacion", "Motivo" as motivo,
         "CanceladoPor" as "canceladoPor"`,
        [registroId, motivo]
      );
      const listaEspera = await ps.manyOrNone(
        `SELECT "Oid" as id, "Usuario" as "usuarioId", "Evento" as "eventoId" FROM "ListaEspera" WHERE "Evento" = $1 AND "GCRecord" IS NULL AND "Atendido" = false ORDER BY "FechaSolicitud" ASC ;`,
        [cancelacion.eventoId]
      );
      if (listaEspera.length > 0) {
        const insertRegistro = await ps.one(
          `INSERT INTO "RegistroEvento"
            ("Oid", "Usuario", "Evento", "FechaRegistro", "Confirmado", "Cancelado")
            VALUES (gen_random_uuid(), $1, $2, NOW(), false, false)
            RETURNING "Oid" as id, "Usuario" as "usuarioId", "Evento" as "eventoId", TO_CHAR("FechaRegistro", 'YYYY-MM-DD') as "fechaRegistro",
            "Confirmado" as confirmado, "Cancelado" as cancelado;`,
          [listaEspera[0].usuarioId, cancelacion.eventoId]
        );
        if (insertRegistro) {
          await ps.none(`UPDATE "ListaEspera" SET "Atendido" = true WHERE "Oid" = $1 AND "GCRecord" IS NULL ;`, [listaEspera.id]);
        }
      }
      const usuario = await ps.oneOrNone(
        `SELECT "Oid" as id, "Nombre" as nombre, "ApellidoPaterno" as "apellidoPaterno", "ApellidoMaterno" as "apellidoMaterno",
            "CorreoElectronico" as "correoElectronico", "Telefono" as "telefono", "CURP" as curp, "Sexo" as sexo,
            TO_CHAR("FechaNacimiento", 'YYYY-MM-DD') as "fechaNacimiento"
            FROM "Usuario" WHERE "Oid" = $1`,
        [cancelacion.usuarioId]
      );
      const evento = await ps.oneOrNone(
        `SELECT "Oid" as id, "Nombre" as nombre, TO_CHAR("Fecha", 'YYYY-MM-DD') as fecha, "Hora" as hora, "Lugar" as lugar
            FROM "Evento" WHERE "Oid" = $1 AND "GCRecord" IS NULL`,
        [cancelacion.eventoId]
      );
      logger.debug('usuario', usuario);
      logger.debug('evento', evento);
      if (usuario || evento) {
        enviarCorreoCancelacion({
          nombreRepresentante: `${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`,
          correoRepresentante: usuario.correoElectronico,
          nombreEvento: evento.nombre,
        });
      }
      return { status: true, message: 'Registro cancelado correctamente', cancelacion: registro };
    } catch (error) {
      logger.error('❌ Error al cancelar registro:', error);
      return manejarError(error, 'Error al cancelar registro');
    }
  },

  async responderEncuesta(_: void, { input }: { input: any }, { ps, recaptchaToken }: { ps: any; recaptchaToken: string }): Promise<any> {
    try {
      const captcha = await validarReCaptcha(recaptchaToken);
      if (!captcha.success) return { status: false, message: captcha.message, data: null };
      const result = await ps.one(
        `INSERT INTO "RespuestaEncuesta"
         ("Oid", "Usuario", "EncuestaEvento", "Respuesta", "FechaRespuesta")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW())
         RETURNING "Oid" as id, "Usuario" as "usuarioId", "EncuestaEvento" as "encuestaEventoId", "Respuesta" as respuesta, TO_CHAR("FechaRespuesta", 'YYYY-MM-DD') as "fechaRespuesta" ;`,
        [input.usuarioId, input.encuestaEventoId, input.respuesta]
      );
      return { status: true, message: 'Respuesta registrada correctamente', respuesta: result };
    } catch (error) {
      logger.error('❌ Error al registrar respuesta:', error);
      return manejarError(error, 'Error al registrar respuesta');
    }
  },

  async registrarEnListaEspera(_: void, { eventoId, usuarioId }: { eventoId: string; usuarioId: string }, { ps, recaptchaToken }: { ps: any; recaptchaToken: string }): Promise<any> {
    try {
      const captcha = await validarReCaptcha(recaptchaToken);
      if (!captcha.success) return { status: false, message: captcha.message, data: null };
      const listaEsperaExistente = await ps.oneOrNone(
        `SELECT "Oid" as id FROM "ListaEspera" WHERE "Usuario" = $1 AND "Evento" = $2 AND "GCRecord" IS NULL`,
        [usuarioId, eventoId]
      );
      if (listaEsperaExistente) {
        return { status: false, message: 'El usuario ya está en la lista de espera para este evento', listaEspera: null };
      }
      const result = await ps.one(
        `INSERT INTO "ListaEspera"
         ("Oid", "Usuario", "Evento", "FechaSolicitud", "Atendido", "OptimisticLockField")
         VALUES (gen_random_uuid(), $1, $2, NOW(), false, 1)
         RETURNING "Oid" as id, "Usuario" as "usuarioId", "Evento" as eventoId, TO_CHAR("FechaSolicitud", 'YYYY-MM-DD') as "fechaSolicitud", "Atendido" as atendido ;`,
        [usuarioId, eventoId]
      );
      const usuario = await ps.oneOrNone(
        `SELECT "Oid" as id, "Nombre" as nombre, "ApellidoPaterno" as "apellidoPaterno", "ApellidoMaterno" as "apellidoMaterno",
            "CorreoElectronico" as "correoElectronico", "Telefono" as "telefono", "CURP" as curp, "Sexo" as sexo,
            TO_CHAR("FechaNacimiento", 'YYYY-MM-DD') as "fechaNacimiento"
            FROM "Usuario" WHERE "Oid" = $1`,
        [usuarioId]
      );
      const evento = await ps.oneOrNone(
        `SELECT "Oid" as id, "Nombre" as nombre, TO_CHAR("Fecha", 'YYYY-MM-DD') as fecha, "Hora" as hora, "Lugar" as lugar
            FROM "Evento" WHERE "Oid" = $1 AND "GCRecord" IS NULL`,
        [eventoId]
      );
      logger.debug('usuario', usuario);
      logger.debug('evento', evento);
      if (usuario || evento) {
        enviarCorreoListaEspera({
          nombreRepresentante: `${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`,
          correoRepresentante: usuario.correoElectronico,
          nombreEvento: evento.nombre,
        });
      }
      return { status: true, message: 'Registro en lista de espera creado correctamente', listaEspera: [result] };
    } catch (error) {
      logger.error('❌ Error al registrar en lista de espera:', error);
      return manejarError(error, 'Error al registrar en lista de espera');
    }
  },
};
