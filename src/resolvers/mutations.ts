import bcryptjs from 'bcryptjs';
import { verificarTokenReCaptcha } from '../middlewares/recaptcha';
import JWT from '../lib/jwt';
import axios from 'axios';
import dotenv from 'dotenv';
import { renderCorreoRegistro } from '../templates/renderCorreo';
import { enviarCorreoCancelacion, enviarCorreoListaEspera, enviarCorreoRegistro } from '../lib/enviarCorreo';

const SECRET_KEY = process.env.JWT_SECRET as string;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET ?? 'TU_SECRET_KEY';
async function validarReCaptcha(token: string) {
    try {
        const captchaValido = await verificarTokenReCaptcha(token);
        if (!captchaValido) {
            return {
                success: false,
                message: 'Fallo la verificación del reCAPTCHA. Acción rechazada.',
            };
        }
        return { success: true };
    } catch (err) {
        console.error('Error validando reCAPTCHA:', err);
        return { success: false, message: 'No se pudo verificar el CAPTCHA' };
    }
}
function manejarError(error: any, mensaje: string) {
    console.error(mensaje, error);
    return { status: false, message: mensaje, data: null };
}

export const mutationResolvers = {
    Mutation: {
        /**
         * Registro de nuevo usuario con validación de reCAPTCHA
         */
        async crearUsuario(
            _: void,
            { input }: { input: any },
            { ps, recaptchaToken }: { ps: any; recaptchaToken: any }
        ): Promise<any> {
            try {
                try {
                  const captcha = await validarReCaptcha(recaptchaToken);
                  if (!captcha.success)
                    return { status: false, message: captcha.message, data: null };
                } catch (err) {
                  console.error('Error validando reCAPTCHA:', err);
                  return {
                    status: false,
                    message: 'No se pudo verificar el CAPTCHA',
                    data: null,
                  };
                }
                // Verificar si el correo electrónico, CURP o teléfono ya están registrados
                const usuarioExistente = await ps.manyOrNone(
                    `SELECT "Oid" as id FROM "Usuario" WHERE "GCRecord" IS NULL AND ("CorreoElectronico" = $1 OR "Telefono" = $2)`,
                    [input.correoElectronico, input.telefono]
                );
                if (usuarioExistente.length > 0) {
                    return {
                        status: false,
                        message: 'El correo electrónico o teléfono ya están registrados',
                        user: null,
                    };
                }
                // Validar que la fecha de nacimiento sea una fecha válida
                if (
                    !input.fechaNacimiento ||
                    isNaN(Date.parse(input.fechaNacimiento))
                ) {
                    return {
                        status: false,
                        message: 'La fecha de nacimiento no es válida',
                        usuario: null,
                    };
                }
                const passwordHash = bcryptjs.hashSync(input.password, 10);

                const newUser = await ps.one(
                    `INSERT INTO "Usuario" 
         ("Oid", "Nombre", "ApellidoPaterno", "ApellidoMaterno", "CorreoElectronico", "Telefono", "CURP", "FechaNacimiento", "Sexo", "Rol", "ContraseñaHash", "FechaRegistro", "EstadoDomicilio", "MunicipioDomicilio", "OptimisticLockField")
         VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),1, $11, $12)
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
                    ]
                );
                return {
                    status: true,
                    message: 'Usuario registrado correctamente',
                    usuario: newUser,
                };
            } catch (error) {
                console.error('Error al crear usuario:', error);
                return manejarError(error, 'Error al crear usuario');
            }
        },
        /**
         * Registro de nuevo usuario con validación de reCAPTCHA
         */
        async deshabilitarUsuario(
            _: void,
            { id }: { id: string },
            {
                ps,
                recaptchaToken,
                token,
            }: { ps: any; recaptchaToken: any; token: string }
        ): Promise<any> {
            try {
                try {
                    const captcha = await validarReCaptcha(recaptchaToken);
                    if (!captcha.success)
                        return { status: false, message: captcha.message, data: null };
                } catch (err) {
                    console.error('Error validando reCAPTCHA:', err);
                    return {
                        status: false,
                        message: 'No se pudo verificar el CAPTCHA',
                        data: null,
                    };
                }
                // Verificar si el correo electrónico o teléfono ya están registrados
                const usuarioExistente = await ps.oneOrNone(
                    `SELECT "Oid" as id FROM "Usuario" WHERE "GCRecord" IS NULL AND "Oid" = $1`,
                    [id]
                );
                if (!usuarioExistente) {
                    return {
                        status: false,
                        message: 'El correo electrónico o teléfono no están registrados',
                        user: null,
                    };
                }

                await ps.none(
                    `UPDATE "Usuario" 
                     SET "GCRecord" = NOW(), "OptimisticLockField" = "OptimisticLockField" + 1
                     WHERE "Oid" = $1 RETURNING "Oid" as id, "Nombre" as nombre, "ApellidoPaterno" as  "apellidoPaterno","ApellidoMaterno" as "apellidoMaterno", "CorreoElectronico" as "correoElectronico", "Rol" as rol ;`,
                    [id]
                );
                return {
                    status: true,
                    message: 'Usuario eliminado correctamente',
                    usuario: null,
                };
            } catch (error) {
                console.error('Error al crear usuario:', error);
                return { status: false, message: 'Error al crear usuario', user: null };
            }
        },
        /**
         * Registro de nuevo usuario con validación de reCAPTCHA
         */
        async actualizarUsuario(
            _: void,
            { input }: { input: any },
            {
                ps,
                recaptchaToken,
                token,
            }: { ps: any; recaptchaToken: any; token: string }
        ): Promise<any> {
            try {
                try {
                    const captcha = await validarReCaptcha(recaptchaToken);
                    if (!captcha.success)
                        return { status: false, message: captcha.message, data: null };
                } catch (err) {
                    console.error('Error validando reCAPTCHA:', err);
                    return {
                        status: false,
                        message: 'No se pudo verificar el CAPTCHA',
                        data: null,
                    };
                }
                try {
                    const info: any = new JWT().verify(token);

                    if (
                        info ===
                        'La autenticación del token es inválida. Por favor, inicia sesión para obtener un nuevo token'
                    ) {
                        return {
                            status: false,
                            message: info,
                            user: null,
                        };
                    }
                } catch (error) {
                    console.error('Error al verificar el token:', error);
                    return {
                        status: false,
                        message: 'Error al verificar el token',
                        user: null,
                    };
                }
                // Verificar si el correo electrónico, CURP o teléfono ya están registrados
                const usuarioExistente = await ps.oneOrNone(
                    `SELECT "Oid" as id FROM "Usuario" WHERE "GCRecord" IS NULL AND ("CorreoElectronico" = $1 OR "Telefono" = $2 )`,
                    [input.correoElectronico, input.telefono]
                );
                if (!usuarioExistente) {
                    return {
                        status: false,
                        message: 'El correo electrónico o teléfono no están registrados',
                        user: null,
                    };
                }

                const fieldsToUpdate = [];
                const values = [];

                if (input.nombre) {
                    fieldsToUpdate.push(`"Nombre" = $${fieldsToUpdate.length + 1}`);
                    values.push(input.nombre);
                }
                if (input.apellidoPaterno) {
                    fieldsToUpdate.push(
                        `"ApellidoPaterno" = $${fieldsToUpdate.length + 1}`
                    );
                    values.push(input.apellidoPaterno);
                }
                if (input.apellidoMaterno) {
                    fieldsToUpdate.push(
                        `"ApellidoMaterno" = $${fieldsToUpdate.length + 1}`
                    );
                    values.push(input.apellidoMaterno);
                }
                if (input.correoElectronico) {
                    fieldsToUpdate.push(
                        `"CorreoElectronico" = $${fieldsToUpdate.length + 1}`
                    );
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
                    fieldsToUpdate.push(
                        `"FechaNacimiento" = $${fieldsToUpdate.length + 1}`
                    );
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
                    return {
                        status: false,
                        message: 'No se proporcionaron campos para actualizar',
                        usuario: null,
                    };
                }

                values.push(input.id); // Add the id as the last parameter

                const updatedUser = await ps.one(
                    `UPDATE "Usuario" 
             SET ${fieldsToUpdate.join(
                        ', '
                    )}, "OptimisticLockField" = "OptimisticLockField" + 1
             WHERE "Oid" = $${values.length}
             RETURNING "Oid" as id, "Nombre" as nombre, "ApellidoPaterno" as "apellidoPaterno", "ApellidoMaterno" as "apellidoMaterno", 
                   "CorreoElectronico" as "correoElectronico", "Telefono" as telefono, "CURP" as curp, TO_CHAR("FechaNacimiento", 'YYYY-MM-DD') as "fechaNacimiento", 
                   "Sexo" as sexo, "Rol" as rol;`,
                    values
                );
                return {
                    status: true,
                    message: 'Usuario actualizado correctamente',
                    usuario: updatedUser,
                };
            } catch (error) {
                console.error('Error al crear usuario:', error);
                return manejarError(error, 'Error al actualizar usuario');
            }
        },
        /**
         * Login de usuario validando contra la BD
         */
        async login(
            _: void,
            { input }: { input: any },
            { ps, recaptchaToken }: { ps: any; recaptchaToken: any }
        ): Promise<any> {
            try {
                try {
                    const captcha = await validarReCaptcha(recaptchaToken);
                    if (!captcha.success)
                        return { status: false, message: captcha.message, data: null };
                } catch (err) {
                    console.error('Error validando reCAPTCHA:', err);
                    return {
                        status: false,
                        message: 'No se pudo verificar el CAPTCHA',
                        data: null,
                    };
                }
                const user = await ps.oneOrNone(
                    `SELECT "Oid" as id, "CorreoElectronico" as "correoElectronico", "Nombre" as nombre, "ApellidoPaterno" as "apellidoPaterno", 
                "ApellidoMaterno" as "apellidoMaterno",   "Telefono" as telefono, "CURP" as curp, TO_CHAR("FechaNacimiento", 'YYYY-MM-DD') as "fechaNacimiento", CASE WHEN "Sexo"=1 THEN 'MUJER' 
                WHEN "Sexo"=2 THEN 'HOMBRE' ELSE 'PENDIENTE' END as sexo, "Domicilio" as domicinio, "ContraseñaHash", 
                "Rol" as rol, "FechaRegistro" as "fechaRegistro"  FROM "Usuario" WHERE "GCRecord" IS NULL AND "CorreoElectronico" = $1`,
                    [input.correoElectronico]
                );

                if (
                    !user ||
                    !bcryptjs.compareSync(input.password, user.ContraseñaHash)
                ) {
                    return {
                        status: false,
                        message: 'Credenciales incorrectas',
                        token: null,
                    };
                }

                const token = new JWT().sign({ user });
                // console.log(token);
                return {
                    status: true,
                    message: 'Login correcto',
                    token,
                    usuario: user,
                };
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                return manejarError(error, 'Error al iniciar sesión');
            }
        },

        /**
         * Registro de inscripción de usuario a evento
         */
        async crearRegistro(
            _: void,
            args: { input: any },
            { ps, recaptchaToken, token }: { ps: any; recaptchaToken: string; token: string }
        ): Promise<any> {
            try {
                const captcha = await validarReCaptcha(recaptchaToken);
                if (!captcha.success) {
                    return { status: false, message: captcha.message, data: null };
                }
            } catch (err) {
                console.error('Error validando reCAPTCHA:', err);
                return manejarError(err, 'No se pudo verificar el CAPTCHA');
            }

            let {
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
                // Obtener los datos del usuarioId de la base de datos
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
      ) RETURNING "Oid" as id, "Usuario" as "usuarioId", "Evento" as "eventoId",
        TO_CHAR("FechaRegistro", 'YYYY-MM-DD') as "fechaRegistro", "Confirmado" as confirmado, "Cancelado" as cancelado,
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
                        anosExperiencia, entidadFederativa, municipio
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
                    console.error('Error al enviar correo de confirmación:', error);
                    return manejarError(error, 'Error al enviar correo de confirmación');
                }

                return {
                    status: true,
                    message: 'El se registró correctamente al evento',
                    registros: [registro],
                };

            } catch (error) {
                console.error('❌ Error al crear registro:', error);
                return manejarError(error, 'Error al crear registro');
            }
        },


        /**
         * Cancelación de un registro de inscripción
         */
        async cancelarRegistro(
            _: void,
            { registroId, motivo }: { registroId: string; motivo: string },
            { ps, recaptchaToken }: { ps: any; recaptchaToken: string }
        ): Promise<any> {
            try {
                // const captcha = await validarReCaptcha(recaptchaToken);
                // if (!captcha.success) return { status: false, message: captcha.message, data: null };
                // Verificar si el registro existe y no ha sido cancelado
                const registroExistente = await ps.oneOrNone(
                    `SELECT "Oid" as id FROM "RegistroEvento" WHERE "Oid" = $1 AND "GCRecord" IS NULL AND "Cancelado" = false`,
                    [registroId]
                );
                if (!registroExistente) {
                    return {
                        status: false,
                        message: 'El registro no existe o ya ha sido cancelado',
                        cancelacion: null,
                    };
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
                // Revisar si hay un registro en lista de espera
                const listaEspera = await ps.manyOrNone(
                    `SELECT "Oid" as id, "Usuario" as "usuarioId", "Evento" as "eventoId" FROM "ListaEspera" WHERE "Evento" = $1 AND "GCRecord" IS NULL AND "Atendido" = false ORDER BY "FechaSolicitud" ASC ;`,
                    [cancelacion.eventoId]
                );
                if (listaEspera.length > 0) {
                    // Insertar el registro en la tabla de "RegistroEvento" con los datos del registro de lista de espera
                    const insertRegistro = await ps.one(
                        `INSERT INTO "RegistroEvento"
            ("Oid", "Usuario", "Evento", "FechaRegistro", "Confirmado", "Cancelado")
            VALUES (gen_random_uuid(), $1, $2, NOW(), false, false)
            RETURNING "Oid" as id, "Usuario" as "usuarioId", "Evento" as "eventoId", TO_CHAR("FechaRegistro", 'YYYY-MM-DD') as "fechaRegistro",
            "Confirmado" as confirmado, "Cancelado" as cancelado;`,
                        [listaEspera[0].usuarioId, cancelacion.eventoId]
                    );

                    // Si hay un registro en lista de espera, actualizarlo a "Atendido"
                    if (insertRegistro) {
                        await ps.none(
                            `UPDATE "ListaEspera" SET "Atendido" = true WHERE "Oid" = $1 AND "GCRecord" IS NULL ;`,
                            [listaEspera.id]
                        );
                    }
                }
                // Obtener los datos del usuario
                const usuario = await ps.oneOrNone(
                    `SELECT "Oid" as id, "Nombre" as nombre, "ApellidoPaterno" as "apellidoPaterno", "ApellidoMaterno" as "apellidoMaterno",
            "CorreoElectronico" as "correoElectronico", "Telefono" as "telefono", "CURP" as curp, "Sexo" as sexo,
            TO_CHAR("FechaNacimiento", 'YYYY-MM-DD') as "fechaNacimiento"
            FROM "Usuario" WHERE "Oid" = $1`,
                    [cancelacion.usuarioId]
                );
                // Obtener los datos del evento
                const evento = await ps.oneOrNone(
                    `SELECT "Oid" as id, "Nombre" as nombre, TO_CHAR("Fecha", 'YYYY-MM-DD') as fecha, "Hora" as hora, "Lugar" as lugar
            FROM "Evento" WHERE "Oid" = $1 AND "GCRecord" IS NULL`,
                    [cancelacion.eventoId]
                );
                console.log('usuario', usuario);
                console.log('evento', evento);
                if (usuario || evento) {
                     enviarCorreoCancelacion({
                        nombreRepresentante: `${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`,
                        correoRepresentante: usuario.correoElectronico,
                        nombreEvento: evento.nombre,
                    });
                }
                return {
                    status: true,
                    message: 'Registro cancelado correctamente',
                    cancelacion: registro,
                };
            } catch (error) {
                console.error('❌ Error al cancelar registro:', error);
                return manejarError(error, 'Error al cancelar registro');
            }
        },

        /**
         * Carga de documento por el usuario
         */
        async cargarDocumento(
            _: void,
            { input }: { input: any },
            { ps, recaptchaToken }: { ps: any; recaptchaToken: string }
        ): Promise<any> {
            try {
                const captcha = await validarReCaptcha(recaptchaToken);
                if (!captcha.success)
                    return { status: false, message: captcha.message, data: null };
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
                    ]
                );
                return {
                    status: true,
                    message: 'Documento cargado correctamente',
                    documento: result,
                };
            } catch (error) {
                console.error('❌ Error al cargar documento:', error);
                return manejarError(error, 'Error al cargar documento');
            }
        },

        /**
         * Registro de respuesta a una encuesta
         */
        async responderEncuesta(
            _: void,
            { input }: { input: any },
            { ps, recaptchaToken }: { ps: any; recaptchaToken: string }
        ): Promise<any> {
            try {
                const captcha = await validarReCaptcha(recaptchaToken);
                if (!captcha.success)
                    return { status: false, message: captcha.message, data: null };
                const result = await ps.one(
                    `INSERT INTO "RespuestaEncuesta" 
         ("Oid", "Usuario", "EncuestaEvento", "Respuesta", "FechaRespuesta")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW()) 
         RETURNING "Oid" as id, "Usuario" as "usuarioId", "EncuestaEvento" as "encuestaEventoId", "Respuesta" as respuesta, TO_CHAR("FechaRespuesta", 'YYYY-MM-DD') as "fechaRespuesta" ;`,
                    [input.usuarioId, input.encuestaEventoId, input.respuesta]
                );
                return {
                    status: true,
                    message: 'Respuesta registrada correctamente',
                    respuesta: result,
                };
            } catch (error) {
                console.error('❌ Error al registrar respuesta:', error);
                return manejarError(error, 'Error al registrar respuesta');
            }
        },

        /**
         * Registro en lista de espera de un evento
         */
        async registrarEnListaEspera(
            _: void,
            { eventoId, usuarioId }: { eventoId: string; usuarioId: string },
            { ps, recaptchaToken }: { ps: any; recaptchaToken: string }
        ): Promise<any> {
            try {
                const captcha = await validarReCaptcha(recaptchaToken);
                if (!captcha.success)
                    return { status: false, message: captcha.message, data: null };
                // Verificar si el usuario ya está en la lista de espera
                const listaEsperaExistente = await ps.oneOrNone(
                    `SELECT "Oid" as id FROM "ListaEspera" WHERE "Usuario" = $1 AND "Evento" = $2 AND "GCRecord" IS NULL`,
                    [usuarioId, eventoId]
                );
                if (listaEsperaExistente) {
                    return {
                        status: false,
                        message:
                            'El usuario ya está en la lista de espera para este evento',
                        listaEspera: null,
                    };
                }
                const result = await ps.one(
                    `INSERT INTO "ListaEspera" 
         ("Oid", "Usuario", "Evento", "FechaSolicitud", "Atendido", "OptimisticLockField")
         VALUES (gen_random_uuid(), $1, $2, NOW(), false, 1) 
         RETURNING "Oid" as id, "Usuario" as "usuarioId", "Evento" as eventoId, TO_CHAR("FechaSolicitud", 'YYYY-MM-DD') as "fechaSolicitud", "Atendido" as atendido ;`,
                    [usuarioId, eventoId]
                );
                // Obtener los datos del usuario
                const usuario = await ps.oneOrNone(
                    `SELECT "Oid" as id, "Nombre" as nombre, "ApellidoPaterno" as "apellidoPaterno", "ApellidoMaterno" as "apellidoMaterno",
            "CorreoElectronico" as "correoElectronico", "Telefono" as "telefono", "CURP" as curp, "Sexo" as sexo,
            TO_CHAR("FechaNacimiento", 'YYYY-MM-DD') as "fechaNacimiento"
            FROM "Usuario" WHERE "Oid" = $1`,
                    [usuarioId]
                );
                // Obtener los datos del evento
                const evento = await ps.oneOrNone(
                    `SELECT "Oid" as id, "Nombre" as nombre, TO_CHAR("Fecha", 'YYYY-MM-DD') as fecha, "Hora" as hora, "Lugar" as lugar
            FROM "Evento" WHERE "Oid" = $1 AND "GCRecord" IS NULL`,
                    [eventoId]
                );
                console.log('usuario', usuario);
                console.log('evento', evento);
                if (usuario || evento) {
                    enviarCorreoListaEspera({
                        nombreRepresentante: `${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`,
                        correoRepresentante: usuario.correoElectronico,
                        nombreEvento: evento.nombre,
                    });
                }
                return {
                    status: true,
                    message: 'Registro en lista de espera creado correctamente',
                    listaEspera: [result],
                };
            } catch (error) {
                console.error('❌ Error al registrar en lista de espera:', error);
                return manejarError(error, 'Error al registrar en lista de espera');
            }
        },
    },
};
