import logger from '../../lib/logger';

export const locationQueries = {
  async estados(_: any, { id }: { id: string }, { ps }: { ps: any }) {
    try {
      const estados = await ps.manyOrNone('SELECT id, "NombreEstado" as "nombreEstado", "CodigoEstado" as "codigoEstado" FROM "Estados" ORDER BY "NombreEstado"');
      return { status: true, message: 'Resultado de estados', estados };
    } catch (error) {
      logger.error('Error en estados:', error);
      return {
        status: false,
        message: 'Error al consultar estados',
        estados: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async estado(_: any, { id }: { id: number }, { ps }: { ps: any }) {
    try {
      const estado = await ps.oneOrNone('SELECT id, "NombreEstado" as "nombreEstado", "CodigoEstado" as "codigoEstado" FROM "Estados" WHERE id = $1', [id]);
      return { status: true, message: 'Resultado de estados', estados: [estado] };
    } catch (error) {
      logger.error('Error en estado:', error);
      return {
        status: false,
        message: 'Error al consultar estado',
        estados: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async municipios(_: any, { id }: { id: number }, { ps }: { ps: any }) {
    try {
      const municipios = await ps.any('SELECT id, "CodigoMunicipio" as "codigoMunicipio", "NombreMunicipio" as "nombreMunicipio", "EstadoId" as "estadoId" FROM "Municipios" ORDER BY "NombreMunicipio"');
      return { status: true, message: 'Resultado de municipios', municipios };
    } catch (error) {
      logger.error('Error en municipios:', error);
      return {
        status: false,
        message: 'Error al consultar municipios',
        municipios: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async municipiosPorEstado(_: any, { estadoId }: { estadoId: number }, { ps }: { ps: any }) {
    try {
      const municipios = await ps.manyOrNone(
        'SELECT id, "NombreMunicipio" as "nombreMunicipio", "EstadoId" as "estadoId", "CodigoMunicipio" as "codigoMunicipio" FROM "Municipios" WHERE "EstadoId" = $1 ORDER BY "NombreMunicipio"',
        [estadoId],
      );
      return { status: true, message: 'Resultado de municipios', municipios };
    } catch (error) {
      logger.error('Error en municipiosPorEstado:', error);
      return {
        status: false,
        message: 'Error al consultar municipios por estado',
        municipios: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async colonias(_: any, { __ }: { __: any }, { ps }: { ps: any }) {
    try {
      const colonias = await ps.any('SELECT id, "CodigoPostal" as "codigoPostal", "NombreColonia", as "nombreColonia", "MunicipioId" as "municipioId" FROM "Colonias" ORDER BY "NombreColonia"');
      return { status: true, message: 'Resultado de colonias', colonias };
    } catch (error) {
      logger.error('Error en colonias:', error);
      return {
        status: false,
        message: 'Error al consultar colonias',
        colonias: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async coloniasPorMunicipio(_: any, { municipioId }: { municipioId: number }, { ps }: { ps: any }) {
    try {
      const colonias = await ps.any(
        'SELECT id, "CodigoPostal" as "codigoPostal", "NombreColonia" as "nombreColonia", "MunicipioId" as "municipioId" FROM "Colonias" WHERE "MunicipioId" = $1 ORDER BY "NombreColonia"',
        [municipioId],
      );
      return { status: true, message: 'Resultado de colonias', colonias };
    } catch (error) {
      logger.error('Error en coloniasPorMunicipio:', error);
      return {
        status: false,
        message: 'Error al consultar colonias por municipio',
        colonias: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
