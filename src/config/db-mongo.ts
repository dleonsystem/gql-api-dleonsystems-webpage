// src/config/db-mongo.ts
import { MongoClient, Db } from 'mongodb';

// Lee las variables de entorno para la conexión
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const MONGO_DBNAME = process.env.MONGO_DBNAME || 'miProyectoDB';

let db: Db;

/**
 * Función para establecer la conexión con MongoDB y retornarla.
 * Esto asegura que solo nos conectemos una vez.
 */
export const connectToMongo = async (): Promise<Db> => {
  if (db) {
    return db;
  }

  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(MONGO_DBNAME);
    console.log(`✅ Conectado a la base de datos MongoDB: ${MONGO_DBNAME}`);
    return db;
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error);
    process.exit(1); // Detiene la aplicación si la conexión a la DB falla
  }
};