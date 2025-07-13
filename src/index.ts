import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
const express = require('express'); // ❗ Reemplazar `require` con `import` por consistencia
import cors from 'cors';
import bodyParser from 'body-parser';

import { typeDefs } from './schema/loadSchema';
import { resolvers } from './resolvers';
import { ps } from './config/db-pg';
import { connectToMongo } from './config/db-mongo'; // <-- 1. IMPORTAR
import { Db } from 'mongodb';                       // <-- 2. IMPORTAR TIPO

/**
 * Interfaz del contexto compartido entre resolvers
 */
interface MyContext {
  ps: typeof ps;                         // Conexión a PostgreSQL
  mongo: Db; // <-- 3. AÑADIR AL CONTEXTO
  token: string | null;                 // Token JWT (Authorization)
  clientIP: string | null;              // IP del cliente (desde proxy o request)
  recaptchaToken: string | null;        // Token enviado por encabezado personalizado
}

// 🔧 Función principal para iniciar el servidor
const startServer = async () => {
  const app = express();

  const mongoDb = await connectToMongo(); // <-- 4. CONECTAR ANTES DE INICIAR


  // Aumentar límites de tamaño de solicitudes usando variables de entorno
  const jsonLimit = process.env.JSON_LIMIT || '20mb';
  const urlencodedLimit = process.env.URLENCODED_LIMIT || '50mb';
  app.use(bodyParser.json({ limit: jsonLimit }));
  app.use(bodyParser.urlencoded({ limit: urlencodedLimit, extended: true }));

  // Confía en proxies (para obtener IP real si hay load balancer)
  app.set('trust proxy', true); // ✅ Buen uso para setups detrás de un proxy

  // Inicialización de Apollo Server
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== 'production', // ✅ Correcto para habilitar introspección solo en desarrollo
  });

  await server.start();

  // 🧠 Apollo Express Middleware + Contexto personalizado
  app.use(
    '/graphql',
    cors(), // ❗ Configurar CORS con reglas específicas para mayor seguridad
    expressMiddleware(server, {
      context: async ({ req }): Promise<MyContext> => {
        const token = req.headers.authorization?.split(' ')[1] || null; // ❗ Validar el token antes de procesarlo
        const recaptchaToken = Array.isArray(req.headers['x-recaptcha-token'])
          ? req.headers['x-recaptcha-token'][0]
          : req.headers['x-recaptcha-token'] || null;
        const clientIP = req.ip || null;

        // ❗ Agregar logging o manejo de errores si algún dato del contexto es inválido
        return {
          ps,
          mongo: mongoDb, // <-- 5. PASAR LA CONEXIÓN AL CONTEXTO
          token,
          clientIP,
          recaptchaToken
        };
      }
    })
  );

  // 🚀 Iniciar servidor en puerto XXXX
  const port = process.env.PORT || 5005; // ✅ Extraer el puerto a una constante para mayor claridad
  app.listen(port, () => {
    console.log(`🚀 Servidor listo en http://localhost:${port}/graphql`);
  });
};

// Manejo de errores global: Atrapar errores que puedan ocurrir durante el inicio del servidor
startServer().catch((error) => {
  console.error('❌ Error al iniciar el servidor:', error);
});
