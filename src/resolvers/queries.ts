import JWT from "../lib/jwt";

export const queryResolvers = {
    Query: {
        /**
         * Consulta de configuración
         */
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
                    configuraciones
                };
            } catch (error) {
                console.error('❌ Error al consultar configuración:', error);
                return {
                    status: false,
                    message: 'Error al consultar configuración',
                    configuraciones: [],
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        },
        /**
         * Consulta de eventos disponibles con estado 'Programado'
         */
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

                return {
                    status: true,
                    message: 'Consulta de eventos exitosa',
                    eventos
                }
            } catch (error) {
                console.error('❌ Error en resolver eventos:', error);

                return {
                    status: false,
                    message: 'Error al consultar eventos',
                    eventos: [],
                    error: error instanceof Error ? error.message : String(error)
                }
            }
        },

        /**
         * Consulta de un evento por su ID
         */
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
                if (!evento) console.warn('⚠️ Evento no encontrado:', args.id);

                return {
                    status: true,
                    message: 'Consulta de evento exitosa',
                    eventos: [evento]
                }
            } catch (error) {
                console.error('❌ Error al obtener evento por ID:', error);

                return {
                    status: false,
                    message: 'Error al consultar evento',
                    evento: null,
                    error: error instanceof Error ? error.message : String(error)
                }
            }
        },

        /**
         * Consulta de usuarios activos
         */
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
                return {
                    status: true,
                    message: 'Consulta de usuarios exitosa',
                    usuarios
                }
            } catch (error) {
                console.error('❌ Error al consultar usuarios:', error);
                return {
                    status: false,
                    message: 'Error al consultar usuarios',
                    usuarios: [],
                    error: error instanceof Error ? error.message : String(error)
                }
            }
        },

        /**
         * Consulta de registros por usuario
         */
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
                return {
                    status: true,
                    message: 'Consulta de registros exitosa',
                    registros
                }
            } catch (error) {
                console.error('❌ Error al consultar registros del usuario:', error);
                return {
                    status: false,
                    message: 'Error al consultar registros del usuario',
                    registros: [],
                    error: error instanceof Error ? error.message : String(error)
                }
            }
        },
        /**
  * Consulta de cancelaciones por usuario
  */
        async cancelacionesPorUsuario(
            _: void,
            args: { usuarioId: string },
            { ps }: { ps: any }
        ): Promise<any> {
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

                return {
                    status: true,
                    message: 'Consulta de cancelaciones exitosa',
                    cancelaciones
                }
            } catch (error) {
                console.error('❌ Error al consultar cancelaciones del usuario:', error);
                return {
                    status: false,
                    message: 'Error al consultar cancelaciones del usuario',
                    cancelaciones: [],
                    error: error instanceof Error ? error.message : String(error)
                }
            }
        },
        archivosPorEvento: async (_: any, { eventoId }: { eventoId: string }, { ps }: { ps: any }) => {
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

                return {
                    status: true,
                    message: 'Consulta de archivos exitosa',
                    archivos
                };
            } catch (error) {
                console.error('Error en archivosPorEvento:', error);
                return {
                    status: false,
                    message: 'Error al consultar archivos del evento',
                    archivos: [],
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        },
        /**
         * Consulta de documentos de usuario
         */
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
                return {
                    status: true,
                    message: 'Consulta de documentos exitosa',
                    documentos
                }
            } catch (error) {
                console.error('❌ Error al consultar documentos del usuario:', error);
                return {
                    status: false,
                    message: 'Error al consultar documentos del usuario',
                    documentos: [],
                    error: error instanceof Error ? error.message : String(error)
                }
            }
        },
        /**
     * Consulta del usuario autenticado (`me`)
     *
     * @param token - token JWT enviado en los headers
     *
     * @returns Información del usuario si el token es válido
     */
        async me(_: void, __: any, { token }: { token: string }): Promise<any> {
            try {
                const info: any = new JWT().verify(token);

                if (info === 'La autenticación del token es inválida. Por favor, inicia sesión para obtener un nuevo token') {
                    return {
                        status: false,
                        message: info,
                        user: null
                    };
                }
                return {
                    status: true,
                    message: 'Token correcto',
                    usuario: info.user
                };
            } catch (error) {
                return {
                    status: false,
                    message: error instanceof Error ? error.message : String(error),
                    user: null,
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        },
        listaEsperaPorEvento: async (_: any, { eventoId }: { eventoId: string }, { ps }: { ps: any }) => {
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

                const lista = await ps.any(query, [eventoId]); // ✅ PASAR PARÁMETRO AQUÍ
                return {
                    status: true,
                    message: 'Consulta de lista de espera exitosa',
                    listaEspera: [lista]
                };

            } catch (error) {
                console.error('Error en listaEsperaPorEvento:', error);
                return {
                    status: false,
                    message: 'Error al consultar la lista de espera',
                    listaEspera: [],
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        },
        usuario: async (_: any, { id }: { id: string }, { ps }: { ps: any }) => {
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

                return {
                    status: true,
                    message: 'Consulta de usuario exitosa',
                    usuarios: [usuario]
                }
            } catch (error) {
                console.error('Error en usuario:', error);
                return {
                    status: false,
                    message: 'Error al consultar el usuario',
                    usuario: [],
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        },
        estados: async (_: any, { id }: { id: string }, { ps }: { ps: any }) => {
            try {
                const estados = await ps.manyOrNone('SELECT id, "NombreEstado" as "nombreEstado", "CodigoEstado" as "codigoEstado" FROM "Estados" ORDER BY "NombreEstado"');
                return { status: true, message: "Resultado de estados", estados };
            } catch (error) {
                console.error('Error en estados:', error);
                return {
                    status: false,
                    message: 'Error al consultar estados',
                    estados: [],
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        },
        estado: async (_: any, { id }: { id: number }, { ps }: { ps: any }) => {
            try {
                const estado = await ps.oneOrNone('SELECT id, "NombreEstado" as "nombreEstado", "CodigoEstado" as "codigoEstado" FROM "Estados" WHERE id = $1', [id]);
                return { status: true, message: "Resultado de estados", estados: [estado] };
            } catch (error) {
                console.error('Error en estado:', error);
                return {
                    status: false,
                    message: 'Error al consultar estado',
                    estados: null,
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        },
        municipios: async (_: any, { id }: { id: number }, { ps }: { ps: any }) => {
            try {
                const municipios = await ps.any('SELECT id, "CodigoMunicipio" as "codigoMunicipio", "NombreMunicipio" as "nombreMunicipio", "EstadoId" as "estadoId" FROM "Municipios" ORDER BY "NombreMunicipio"');
                return { status: true, message: "Resultado de municipios", municipios };
            } catch (error) {
                console.error('Error en municipios:', error);
                return {
                    status: false,
                    message: 'Error al consultar municipios',
                    municipios: [],
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        },
        municipiosPorEstado: async (_: any, { estadoId }: { estadoId: number, ps: any }, { ps }: { ps: any }) => {
            try {
                const municipios = await ps.manyOrNone(
                    'SELECT id, "NombreMunicipio" as "nombreMunicipio", "EstadoId" as "estadoId", "CodigoMunicipio" as "codigoMunicipio" FROM "Municipios" WHERE "EstadoId" = $1 ORDER BY "NombreMunicipio"',
                    [estadoId]
                );
                return {
                    status: true, message: "Resultado de municipios", municipios
                };
            } catch (error) {
                console.error('Error en municipiosPorEstado:', error);
                return {
                    status: false,
                    message: 'Error al consultar municipios por estado',
                    municipios: [],
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        },
        colonias: async (_: any, { __ }: { __: any }, { ps }: { ps: any }) => {
            try {
                const colonias = await ps.any('SELECT id, "CodigoPostal" as "codigoPostal", "NombreColonia", as "nombreColonia", "MunicipioId" as "municipioId" FROM "Colonias" ORDER BY "NombreColonia"');
                return { status: true, message: "Resultado de colonias", colonias };
            } catch (error) {
                console.error('Error en colonias:', error);
                return {
                    status: false,
                    message: 'Error al consultar colonias',
                    colonias: [],
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        },
        coloniasPorMunicipio: async (_: any, { municipioId }: { municipioId: number }, { ps }: { ps: any }) => {
            try {
                const colonias = await ps.any(
                    'SELECT id, "CodigoPostal" as "codigoPostal", "NombreColonia" as "nombreColonia", "MunicipioId" as "municipioId" FROM "Colonias" WHERE "MunicipioId" = $1 ORDER BY "NombreColonia"',
                    [municipioId]
                );
                return {
                    status: true, message: "Resultado de colonias", colonias
                };
            } catch (error) {
                console.error('Error en coloniasPorMunicipio:', error);
                return {
                    status: false,
                    message: 'Error al consultar colonias por municipio',
                    colonias: [],
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        }

    },

};
