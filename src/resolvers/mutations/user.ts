import bcryptjs from 'bcryptjs';
import JWT from '../../lib/jwt';
import logger from '../../lib/logger';
import { validarReCaptcha, manejarError } from './helpers';

export const userMutations = {
  async crearUsuario(_: void, { input }: { input: any }, { ps, recaptchaToken }: { ps: any; recaptchaToken: any }): Promise<any> {
    try {
      const captcha = await validarReCaptcha(recaptchaToken);
      if (!captcha.success) return { status: false, message: captcha.message, data: null };
      const usuarioExistente = await ps.manyOrNone(
        `SELECT "Oid" as id FROM "Usuario" WHERE "GCRecord" IS NULL AND ("CorreoElectronico" = $1 OR "Telefono" = $2)`,
        [input.correoElectronico, input.telefono],
      );
      if (usuarioExistente.length > 0) {
        return { status: false, message: 'El correo electrónico o teléfono ya están registrados', user: null };
      }
      if (!input.fechaNacimiento || isNaN(Date.parse(input.fechaNacimiento))) {
        return { status: false, message: 'La fecha de nacimiento no es válida', usuario: null };
      }
      const passwordHash = bcryptjs.hashSync(input.password, 10);
      const newUser = await ps.one(
        `INSERT INTO "Usuario"
         ("Oid", "Nombre", "ApellidoPaterno", "ApellidoMaterno", "CorreoElectronico", "Telefono", "CURP", "FechaNacimiento", "Sexo", "Rol", "ContraseñaHash", "FechaRegistro", "EstadoDomicilio", "MunicipioDomicilio", "OptimisticLockField")
         VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),1, $11,$12)
         RETURNING "Oid" as id, "Nombre" as nombre, "ApellidoPaterno" as  "apellidoPaterno","ApellidoMaterno" as "apellidoMaterno", "CorreoElectronico" as "correoElectronico", "Rol" as rol, "EstadoDomicilio" as "estadoId", "MunicipioDomicilio" as "municipioId" ;`,
        [
          input.nombre,
          input.apellidoPaterno,
          input.apellidoMaterno,
          input.correoElectronico,
          input.telefono,
          input.curp,
          input.fechaNacimiento,
          input.sexo,
          input.rol,
          passwordHash,
          input.estado,
          input.municipio,
        ],
      );
      return { status: true, message: 'Usuario registrado correctamente', usuario: newUser };
    } catch (error) {
      logger.error('Error al crear usuario:', error);
      return manejarError(error, 'Error al crear usuario');
    }
  },

  async deshabilitarUsuario(_: void, { id }: { id: string }, { ps, recaptchaToken, token }: { ps: any; recaptchaToken: any; token: string }): Promise<any> {
    try {
      const captcha = await validarReCaptcha(recaptchaToken);
      if (!captcha.success) return { status: false, message: captcha.message, data: null };
      const usuarioExistente = await ps.oneOrNone(
        `SELECT "Oid" as id FROM "Usuario" WHERE "GCRecord" IS NULL AND "Oid" = $1`,
        [id],
      );
      if (!usuarioExistente) {
        return { status: false, message: 'El correo electrónico o teléfono no están registrados', user: null };
      }
      await ps.none(
        `UPDATE "Usuario"
                     SET "GCRecord" = NOW(), "OptimisticLockField" = "OptimisticLockField" + 1
                     WHERE "Oid" = $1 RETURNING "Oid" as id, "Nombre" as nombre, "ApellidoPaterno" as  "apellidoPaterno","ApellidoMaterno" as "apellidoMaterno", "CorreoElectronico" as "correoElectronico", "Rol" as rol ;`,
        [id],
      );
      return { status: true, message: 'Usuario eliminado correctamente', usuario: null };
    } catch (error) {
      logger.error('Error al crear usuario:', error);
      return { status: false, message: 'Error al crear usuario', user: null };
    }
  },

  async actualizarUsuario(_: void, { input }: { input: any }, { ps, recaptchaToken, token }: { ps: any; recaptchaToken: any; token: string }): Promise<any> {
    try {
      const captcha = await validarReCaptcha(recaptchaToken);
      if (!captcha.success) return { status: false, message: captcha.message, data: null };
      try {
        const info: any = new JWT().verify(token);
        if (info === 'La autenticación del token es inválida. Por favor, inicia sesión para obtener un nuevo token') {
          return { status: false, message: info, user: null };
        }
      } catch (error) {
        logger.error('Error al verificar el token:', error);
        return { status: false, message: 'Error al verificar el token', user: null };
      }
      const usuarioExistente = await ps.oneOrNone(
        `SELECT "Oid" as id FROM "Usuario" WHERE "GCRecord" IS NULL AND ("CorreoElectronico" = $1 OR "Telefono" = $2 )`,
        [input.correoElectronico, input.telefono],
      );
      if (!usuarioExistente) {
        return { status: false, message: 'El correo electrónico o teléfono no están registrados', user: null };
      }
      const fieldsToUpdate = [] as string[];
      const values = [] as any[];
      if (input.nombre) {
        fieldsToUpdate.push(`"Nombre" = $${fieldsToUpdate.length + 1}`);
        values.push(input.nombre);
      }
      if (input.apellidoPaterno) {
        fieldsToUpdate.push(`"ApellidoPaterno" = $${fieldsToUpdate.length + 1}`);
        values.push(input.apellidoPaterno);
      }
      if (input.apellidoMaterno) {
        fieldsToUpdate.push(`"ApellidoMaterno" = $${fieldsToUpdate.length + 1}`);
        values.push(input.apellidoMaterno);
      }
      if (input.correoElectronico) {
        fieldsToUpdate.push(`"CorreoElectronico" = $${fieldsToUpdate.length + 1}`);
        values.push(input.correoElectronico);
      }
      if (input.telefono) {
        fieldsToUpdate.push(`"Telefono" = $${fieldsToUpdate.length + 1}`);
        values.push(input.telefono);
      }
      if (input.curp) {
        fieldsToUpdate.push(`"CURP" = $${fieldsToUpdate.length + 1}`);
        values.push(input.curp);
      }
      if (input.fechaNacimiento) {
        fieldsToUpdate.push(`"FechaNacimiento" = $${fieldsToUpdate.length + 1}`);
        values.push(input.fechaNacimiento);
      }
      if (input.sexo) {
        fieldsToUpdate.push(`"Sexo" = $${fieldsToUpdate.length + 1}`);
        values.push(input.sexo);
      }
      if (input.rol) {
        fieldsToUpdate.push(`"Rol" = $${fieldsToUpdate.length + 1}`);
        values.push(input.rol);
      }
      if (fieldsToUpdate.length === 0) {
        return { status: false, message: 'No se proporcionaron campos para actualizar', usuario: null };
      }
      values.push(input.id);
      const updatedUser = await ps.one(
        `UPDATE "Usuario"
             SET ${fieldsToUpdate.join(', ')} , "OptimisticLockField" = "OptimisticLockField" + 1
             WHERE "Oid" = $${values.length}
             RETURNING "Oid" as id, "Nombre" as nombre, "ApellidoPaterno" as "apellidoPaterno", "ApellidoMaterno" as "apellidoMaterno",
                   "CorreoElectronico" as "correoElectronico", "Telefono" as telefono, "CURP" as curp, TO_CHAR("FechaNacimiento", 'YYYY-MM-DD') as "fechaNacimiento",
                   "Sexo" as sexo, "Rol" as rol;`,
        values,
      );
      return { status: true, message: 'Usuario actualizado correctamente', usuario: updatedUser };
    } catch (error) {
      logger.error('Error al crear usuario:', error);
      return manejarError(error, 'Error al actualizar usuario');
    }
  },

  async login(_: void, { input }: { input: any }, { ps, recaptchaToken }: { ps: any; recaptchaToken: any }): Promise<any> {
    try {
      const captcha = await validarReCaptcha(recaptchaToken);
      if (!captcha.success) return { status: false, message: captcha.message, data: null };
      const user = await ps.oneOrNone(
        `SELECT "Oid" as id, "CorreoElectronico" as "correoElectronico", "Nombre" as nombre, "ApellidoPaterno" as "apellidoPaterno",
                "ApellidoMaterno" as "apellidoMaterno",   "Telefono" as telefono, "CURP" as curp, TO_CHAR("FechaNacimiento", 'YYYY-MM-DD') as "fechaNacimiento", CASE WHEN "Sexo"=1 THEN 'MUJER'
                WHEN "Sexo"=2 THEN 'HOMBRE' ELSE 'PENDIENTE' END as sexo, "Domicilio" as domicinio, "ContraseñaHash",
                "Rol" as rol, "FechaRegistro" as "fechaRegistro"  FROM "Usuario" WHERE "GCRecord" IS NULL AND "CorreoElectronico" = $1`,
        [input.correoElectronico],
      );
      if (!user || !bcryptjs.compareSync(input.password, user.ContraseñaHash)) {
        return { status: false, message: 'Credenciales incorrectas', token: null };
      }
      const token = new JWT().sign({ user });
      return { status: true, message: 'Login correcto', token, usuario: user };
    } catch (error) {
      logger.error('Error al iniciar sesión:', error);
      return manejarError(error, 'Error al iniciar sesión');
    }
  },

  async cargarDocumento(_: void, { input }: { input: any }, { ps, recaptchaToken }: { ps: any; recaptchaToken: string }): Promise<any> {
    try {
      const captcha = await validarReCaptcha(recaptchaToken);
      if (!captcha.success) return { status: false, message: captcha.message, data: null };
      const result = await ps.one(
        `INSERT INTO "DocumentoUsuario"
         ("Oid", "Usuario", "DocumentoEventoTipo", "NombreArchivo", "RutaAlmacenamiento", "FechaCarga", "Version", "Observaciones")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), $5, $6)
         RETURNING "Oid" as id, "Usuario" as "usuarioId", "DocumentoEventoTipo" as "documentoEventoTipoId", "NombreArchivo" as "nombreArchivo", "RutaAlmacenamiento" as "rutaAlmacenamiento",
         TO_CHAR("FechaCarga",'YYYY-MM-DD') as "fechaCarga", "Version" as version, "Observaciones" as observaciones`,
        [
          input.usuarioId,
          input.documentoEventoTipoId,
          input.nombreArchivo,
          input.rutaAlmacenamiento,
          input.version,
          input.observaciones,
        ],
      );
      return { status: true, message: 'Documento cargado correctamente', documento: result };
    } catch (error) {
      logger.error('❌ Error al cargar documento:', error);
      return manejarError(error, 'Error al cargar documento');
    }
  },
};
