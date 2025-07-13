import { Db } from 'mongodb';
import logger from '../../lib/logger';

export const contentQueries = {
  async testimonials(_: void, __: any, { mongo }: { mongo: Db }): Promise<any> {
    try {
      const collection = mongo.collection('testimonials');
      const testimonialsData = await collection.find({}).toArray();
      return testimonialsData;
    } catch (error) {
      logger.error('❌ Error al consultar testimonios:', error);
      return [];
    }
  },

  async successCases(_: void, __: any, { mongo }: { mongo: Db }): Promise<any> {
    try {
      const collection = mongo.collection('successCases');
      const data = await collection.findOne({});
      return data ? data.es : [];
    } catch (error) {
      logger.error('❌ Error al consultar casos de éxito:', error);
      return [];
    }
  },

  async portfolio(_: void, { language }: { language: string }, { mongo }: { mongo: Db }): Promise<any> {
    try {
      const data = await mongo.collection('portfolio').findOne({});
      return data && data[language] ? data[language] : [];
    } catch (error) {
      logger.error('❌ Error al consultar el portafolio:', error);
      return [];
    }
  },

  async services(_: void, { language }: { language: string }, { mongo }: { mongo: Db }): Promise<any> {
    try {
      const data = await mongo.collection('services').findOne({});
      return data && data[language] ? data[language] : null;
    } catch (error) {
      logger.error('❌ Error al consultar los servicios:', error);
      return null;
    }
  },

  async blog(_: void, { language }: { language: string }, { mongo }: { mongo: Db }): Promise<any> {
    try {
      const data = await mongo.collection('blog').find({}).toArray();
      const blogData = data[0];
      return blogData && blogData[language] ? blogData[language] : [];
    } catch (error) {
      logger.error('❌ Error al consultar el blog:', error);
      return [];
    }
  },
};
