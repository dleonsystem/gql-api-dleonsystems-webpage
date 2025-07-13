import { connectionString } from '../config/db-pg';
import logger from '../lib/logger';
export const typeResolvers = {
  Evento: {
    async cupoDisponible(
      parent: any,
      __: any,
      { ps }: { ps: any }
    ): Promise<any> {
      try {
        const cupo = await ps.oneOrNone(
          `
SELECT COUNT(*) as "inscritos" FROM "RegistroEvento" WHERE "Evento" = $1 AND "Cancelado" is not true;
`,
          [parent.id]
        );
        return (
          parseInt(parent.capacidadMaxima, 10) - parseInt(cupo.inscritos, 10)
        );
      } catch (error) {
        logger.error('Error fetching cupoDisponible:', error);
        throw new Error('Error fetching cupoDisponible');
      }
    },
  },
  Usuario: {
    async eventos(parent: any, __: any, { ps }: { ps: any }): Promise<any> {
      try {
        const eventos = await ps.manyOrNone(
          `
SELECT
  "Oid" as id, "Nombre" as nombre, "Descripcion" as descripcion, TO_CHAR("Fecha", 'YYYY-MM-DD') as fecha, "Hora" as hora, "CapacidadMaxima" as "capacidadMaxima",
    "Lugar" as lugar, "Tipo" as tipo, "Estado" as estado, "URLImagen" as "urlImagen", "EstadoDomicilio" as "estadoId", "MunicipioDomicilio" as "municipioId"
FROM public."Evento"
WHERE "Oid" IN (
    SELECT "Evento" FROM "RegistroEvento" WHERE "Usuario" = $1 AND "Cancelado" is not true
)
ORDER BY "Fecha" DESC
`,
          [parent.id]
        );
        return eventos;
      } catch (error) {
        logger.error('Error fetching eventos:', error);
        throw new Error('Error fetching eventos');
      }
    },
    async estado(parent: any, __: any, { ps }: { ps: any }): Promise<any> {
      try {
        const estado = await ps.oneOrNone(
          `
SELECT id, "NombreEstado" as "nombreEstado", "CodigoEstado" as "codigoEstado" FROM "Estados" WHERE id = $1`,
          [parent.estadoId]
        );
        return estado;
      } catch (error) {
        logger.error('Error fetching estado:', error);
        throw new Error('Error fetching estado');
      }
    },
    async municipio(parent: any, __: any, { ps }: { ps: any }): Promise<any> {
      try {
        const municipio = await ps.oneOrNone(
          `
SELECT id, "NombreMunicipio" as "nombreMunicipio", "CodigoMunicipio" as "codigoMunicipio", "EstadoId" as "estadoId" FROM "Municipios" WHERE id = $1`,
          [parent.municipioId]
        );
        return municipio;
      } catch (error) {
        logger.error('Error fetching municipio:', error);
        throw new Error('Error fetching municipio');
      }
    },
  },
  RegistroEvento: {
    async evento(parent: any, __: any, { ps }: { ps: any }): Promise<any> {
      try {
        const evento = await ps.oneOrNone(
          `
SELECT 
  "Oid" as id, "Nombre" as nombre, "Descripcion" as descripcion, TO_CHAR("Fecha", 'YYYY-MM-DD') as fecha, "Hora" as hora, "CapacidadMaxima" as "capacidadMaxima", 
  "Lugar" as lugar, "Tipo" as tipo, "Estado" as estado, "URLImagen" as "urlImagen"
FROM public."Evento"
WHERE "Oid" = $1
  `,
          [parent.eventoId]
        );
        return evento;
      } catch (error) {
        logger.error('Error fetching evento:', error);
        throw new Error('Error fetching evento');
      }
    },
    async usuario(
      parent: any,
      args: { correoElectronico: string; telefono: string; curp: string },
      { ps }: { ps: any }
    ): Promise<any> {
      try {
        if (!parent.usuarioId) {
          return null;
        }
        const usuario = await ps.oneOrNone(
          `SELECT 
                        "Oid" as id, "Nombre" as nombre, "ApellidoPaterno" as "apellidoPaterno", "ApellidoMaterno" as "apellidoMaterno", "CorreoElectronico" as "correoElectronico", 
                        "CURP" as curp, "Telefono" as telefono, "Sexo" as sexo, TO_CHAR("FechaNacimiento", 'YYYY-MM-DD') as "FechaNacimiento", "Domicilio" as domicilio, "Rol" as rol
                      FROM public."Usuario"
                      WHERE "Oid" = $1
                        `,
          [parent.usuarioId]
        );
        return usuario;
      } catch (error) {
        logger.error('Error fetching usuario:', error);
        throw new Error('Error fetching usuario');
      }
    },
  },
  Estado: {
    municipios: async (parent: any, __: { __: any }, { ps }: { ps: any }) => {
      try {
        return await ps.any(
          'SELECT id, "EstadoId" as "estadoId", "CodigoMunicipio" as "codigoMunicipio", "NombreMunicipio" as "nombreMunicipio" FROM "Municipios" WHERE "EstadoId" = $1 ORDER BY "NombreMunicipio"',
          [parent.id]
        );
      } catch (error) {
        logger.error('Error fetching municipios:', error);
        throw new Error('Error fetching municipios');
      }
    },
  },

  Municipio: {
    estado: async (parent: any, __: { __: any }, { ps }: { ps: any }) => {
      try {
        return await ps.one(
          'SELECT id, "NombreEstado" as "nombreEstado", "CodigoEstado" as "codigoEstado" FROM "Estados" WHERE id = $1',
          [parent.EstadoId]
        );
      } catch (error) {
        logger.error('Error fetching estado:', error);
        throw new Error('Error fetching estado');
      }
    },
    colonias: async (parent: any, __: { __: any }, { ps }: { ps: any }) => {
      try {
        return await ps.any(
          'SELECT id, "CodigoPostal" as "codigoPostal", "NombreColonia" as "nombreColonia" FROM "Colonias" WHERE "MunicipioId" = $1 ORDER BY "NombreColonia"',
          [parent.id]
        );
      } catch (error) {
        logger.error('Error fetching colonias:', error);
        throw new Error('Error fetching colonias');
      }
    },
  },
  Colonia: {
    municipio: async (parent: any, __: { __: any }, { ps }: { ps: any }) => {
      try {
        return await ps.one(
          'SELECT id, "NombreMunicipio" as "nombreMunicipio", "CodigoMunicipio" as "codigoMunicipio", "EstadoId" as "estadoId" FROM "Municipios" WHERE id = $1',
          [parent.MunicipioId]
        );
      } catch (error) {
        logger.error('Error fetching municipio:', error);
        throw new Error('Error fetching municipio');
      }
    },
  },
};
