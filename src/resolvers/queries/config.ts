import logger from '../../lib/logger';

export const configQueries = {
  async getConfiguracion(_: void, __: any, { ps }: { ps: any }): Promise<any> {
    try {
      const configuraciones = await ps.any(`
    SELECT
      "OID" AS id,
      "Valor" AS valor,
      "Descripcion" AS descripcion,
      TO_CHAR("FechaCreacion", 'YYYY-MM-DD') AS "fechaCreacion",
      "Activo" AS activo,
      "Llave" AS llave
    FROM "Configuracion"
    WHERE "Activo" = true
      `);
      return {
        status: true,
        message: 'Consulta de configuración exitosa',
        configuraciones,
      };
    } catch (error) {
      logger.error('❌ Error al consultar configuración:', error);
      return {
        status: false,
        message: 'Error al consultar configuración',
        configuraciones: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
