import JWT from '../../lib/jwt';
import logger from '../../lib/logger';

export const userQueries = {
  async usuarios(_: void, __: any, { ps }: { ps: any }): Promise<any> {
    try {
      const usuarios = await ps.any(`
            SELECT
              "Oid" AS id,
              "Nombre" AS nombre,
              "ApellidoPaterno" AS "apellidoPaterno",
              "ApellidoMaterno" AS "apellidoMaterno",
              "CorreoElectronico" AS "correoElectronico",
              "Telefono" AS telefono,
              "CURP" AS curp,
              TO_CHAR("FechaNacimiento", 'YYYY-MM-DD') AS "fechaNacimiento",
              CASE
              WHEN "Sexo" = 1 THEN 'MUJER'
              WHEN "Sexo" = 2 THEN 'HOMBRE'
              ELSE 'PENDIENTE'
              END AS sexo,
              "Domicilio" AS domicilio,
              "Rol" AS rol,
              TO_CHAR("FechaRegistro", 'YYYY-MM-DD') AS "fechaRegistro",
                "EstadoDomicilio" AS "estadoId",
                "MunicipioDomicilio" AS "municipioId"
            FROM "Usuario"
            WHERE "GCRecord" IS NULL
          `);
      return { status: true, message: 'Consulta de usuarios exitosa', usuarios };
    } catch (error) {
      logger.error('❌ Error al consultar usuarios:', error);
      return {
        status: false,
        message: 'Error al consultar usuarios',
        usuarios: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async registrosPorUsuario(_: void, args: { usuarioId: string }, { ps }: { ps: any }): Promise<any> {
    try {
      const registros = await ps.any(`
            SELECT
              "Oid" AS id,
              "Evento" AS "eventoId",
              "Usuario" AS "usuarioId",
              TO_CHAR("FechaRegistro", 'YYYY-MM-DD') AS "fechaRegistro",
              "Confirmado" AS confirmado,
              "Cancelado" AS cancelado
            FROM "RegistroEvento"
            WHERE "Usuario"::varchar = $1::varchar AND "GCRecord" IS NULL and "Cancelado" is not true
          `, [args.usuarioId]);
      return { status: true, message: 'Consulta de registros exitosa', registros };
    } catch (error) {
      logger.error('❌ Error al consultar registros del usuario:', error);
      return {
        status: false,
        message: 'Error al consultar registros del usuario',
        registros: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async cancelacionesPorUsuario(_: void, args: { usuarioId: string }, { ps }: { ps: any }): Promise<any> {
    try {
      const cancelaciones = await ps.any(`
        SELECT
          "CancelacionRegistro"."Oid" AS id,
          "Motivo" AS motivo,
          "RegistroEvento" AS "registroEvento",
          TO_CHAR("FechaCancelacion", 'YYYY-MM-DD') AS "fechaCancelacion",
          "CanceladoPor" AS "canceladoPor"
        FROM "CancelacionRegistro"
        JOIN "RegistroEvento" ON "CancelacionRegistro"."RegistroEvento" = "RegistroEvento"."Oid"
        WHERE "RegistroEvento"."Usuario"::varchar = $1::varchar AND "CancelacionRegistro"."GCRecord" IS NULL
      `, [args.usuarioId]);
      return { status: true, message: 'Consulta de cancelaciones exitosa', cancelaciones };
    } catch (error) {
      logger.error('❌ Error al consultar cancelaciones del usuario:', error);
      return {
        status: false,
        message: 'Error al consultar cancelaciones del usuario',
        cancelaciones: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async documentosPorUsuario(_: void, args: { usuarioId: string }, { ps }: { ps: any }): Promise<any> {
    try {
      const documentos = await ps.any(`
            SELECT
              "Oid" AS id,
              "DocumentoEventoTipo" AS "documentoEventoTipoId",
              "NombreArchivo" AS "nombreArchivo",
              "RutaAlmacenamiento" AS "rutaAlmacenamiento",
              TO_CHAR("FechaCarga", 'YYYY-MM-DD') AS "fechaCarga",
              "Version" AS version,
              "Observaciones" AS observaciones
            FROM "DocumentoUsuario"
            WHERE "Usuario"::varchar = $1::varchar AND "GCRecord" IS NULL
          `, [args.usuarioId]);
      return { status: true, message: 'Consulta de documentos exitosa', documentos };
    } catch (error) {
      logger.error('❌ Error al consultar documentos del usuario:', error);
      return {
        status: false,
        message: 'Error al consultar documentos del usuario',
        documentos: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async me(_: void, __: any, { token }: { token: string }): Promise<any> {
    try {
      const info: any = new JWT().verify(token);
      if (info === 'La autenticación del token es inválida. Por favor, inicia sesión para obtener un nuevo token') {
        return { status: false, message: info, user: null };
      }
      return { status: true, message: 'Token correcto', usuario: info.user };
    } catch (error) {
      return {
        status: false,
        message: error instanceof Error ? error.message : String(error),
        user: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async usuario(_: any, { id }: { id: string }, { ps }: { ps: any }) {
    try {
      const usuario = await ps.oneOrNone(`
                SELECT
                  "Oid" AS "id",
                  "Nombre" AS "nombre",
                  "ApellidoPaterno" AS "apellidoPaterno",
                  "ApellidoMaterno" AS "apellidoMaterno",
                  "CorreoElectronico" AS "correoElectronico",
                  "Telefono" AS "telefono",
                  "CURP" AS "curp",
                  TO_CHAR("FechaNacimiento", 'YYYY-MM-DD') AS "fechaNacimiento",
                   CASE
                   WHEN "Sexo" = 0 THEN 'MUJER'
                    WHEN "Sexo" = 1 THEN 'HOMBRE'
                   ELSE 'PENDIENTE'
                   END AS "sexo",
                  "Domicilio" AS "domicilio",
                  "Rol" AS "rol",
                  TO_CHAR("FechaRegistro", 'YYYY-MM-DD') AS "fechaRegistro"
                FROM "Usuario"
                WHERE "Oid" = $1 and "GCRecord" IS NULL
              `, [id]);
      return { status: true, message: 'Consulta de usuario exitosa', usuarios: [usuario] };
    } catch (error) {
      logger.error('Error en usuario:', error);
      return {
        status: false,
        message: 'Error al consultar el usuario',
        usuario: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
