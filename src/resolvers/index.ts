import { queryResolvers } from './queries';
import { mutationResolvers } from './mutations';
import { typeResolvers } from './types';

export const resolvers = {
  ...queryResolvers,
  ...mutationResolvers,
  ...typeResolvers,
};
