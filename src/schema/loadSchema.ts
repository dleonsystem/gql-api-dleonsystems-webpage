// src/schema/loadSchema.ts
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import path from 'path';

const schemaPath = path.join(__dirname, '../graphql/**/*.graphql');

export const typeDefs = loadSchemaSync(schemaPath, {
  loaders: [new GraphQLFileLoader()],
});
