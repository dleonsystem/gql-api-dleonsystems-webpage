import logger from '../../lib/logger';

export const eventQueries = {
  async eventos(_: void, __: any, { ps }: { ps: any }): Promise<any> {
    try {
      const eventos = await ps.any(`
            SELECT
              "Oid" AS id,
              "Nombre" AS nombre,
              "Descripcion" AS descripcion,
              TO_CHAR("Fecha", 'YYYY-MM-DD') AS fecha,
              "Hora" AS hora,
              "CapacidadMaxima" AS "capacidadMaxima",
              "Lugar" AS lugar,
              "Tipo" AS tipo,
              "Estado" AS estado,
              "URLImagen" AS "urlImagen",
              "Destacado" AS destacado,
              CASE
              WHEN "Modalidad" = 2 THEN 'HIBRIDA'
              WHEN "Modalidad" = 1 THEN 'VIRTUAL'
              ELSE 'PRESENCIAL'
              END AS modalidad
            FROM "Evento"
            WHERE "GCRecord" IS NULL AND "Estado" = $1
          `, ['Programado']);
      return { status: true, message: 'Consulta de eventos exitosa', eventos };
    } catch (error) {
      logger.error('❌ Error en resolver eventos:', error);
      return {
        status: false,
        message: 'Error al consultar eventos',
        eventos: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async evento(_: void, args: { id: string }, { ps }: { ps: any }): Promise<any> {
    try {
      const evento = await ps.oneOrNone(`
            SELECT
              "Oid" AS id,
              "Nombre" AS nombre,
              "Descripcion" AS descripcion,
              TO_CHAR("Fecha", 'YYYY-MM-DD') AS fecha,
              "Hora" AS hora,
              "CapacidadMaxima" AS "capacidadMaxima",
              "Lugar" AS lugar,
              "Tipo" AS tipo,
              "Estado" AS estado,
              "URLImagen" AS "urlImagen",
              "Destacado" AS destacado,
              CASE
              WHEN "Modalidad" = 2 THEN 'HIBRIDA'
              WHEN "Modalidad" = 1 THEN 'VIRTUAL'
              ELSE 'PRESENCIAL'
              END AS modalidad
            FROM "Evento"
            WHERE "Oid" = $1 AND "GCRecord" IS NULL
          `, [args.id]);
      if (!evento) logger.warn('⚠️ Evento no encontrado:', args.id);
      return { status: true, message: 'Consulta de evento exitosa', eventos: [evento] };
    } catch (error) {
      logger.error('❌ Error al obtener evento por ID:', error);
      return {
        status: false,
        message: 'Error al consultar evento',
        evento: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async archivosPorEvento(_: any, { eventoId }: { eventoId: string }, { ps }: { ps: any }) {
    try {
      const archivos = await ps.any(
        `
                SELECT
                  "Oid" AS "id",
                  "Evento" AS "eventoId",
                  "NombreArchivo" AS "nombreArchivo",
                  "RutaAlmacenamiento" AS "rutaAlmacenamiento",
                  "TipoArchivo" AS "tipoArchivo",
                  TO_CHAR("FechaCarga", 'YYYY-MM-DD') AS "fechaCarga"
                FROM "ArchivoEvento"
                WHERE "Evento"::VARCHAR = $1::VARCHAR AND "GCRecord" IS NULL
                `,
        [eventoId]
      );
      return { status: true, message: 'Consulta de archivos exitosa', archivos };
    } catch (error) {
      logger.error('Error en archivosPorEvento:', error);
      return {
        status: false,
        message: 'Error al consultar archivos del evento',
        archivos: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async listaEsperaPorEvento(_: any, { eventoId }: { eventoId: string }, { ps }: { ps: any }) {
    try {
      const query = `
                SELECT
                  "Oid" AS "id",
                  "Usuario" AS "usuarioId",
                  "Evento" AS "eventoId",
                  TO_CHAR("FechaSolicitud", 'YYYY-MM-DD') AS "fechaSolicitud",
                  "Atendido" AS "atendido"
                FROM "ListaEspera"
                WHERE "Evento"::varchar = $1::varchar and "GCRecord" IS NULL
                ORDER BY "FechaSolicitud" DESC
              `;
      const lista = await ps.any(query, [eventoId]);
      return { status: true, message: 'Consulta de lista de espera exitosa', listaEspera: [lista] };
    } catch (error) {
      logger.error('Error en listaEsperaPorEvento:', error);
      return {
        status: false,
        message: 'Error al consultar la lista de espera',
        listaEspera: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
