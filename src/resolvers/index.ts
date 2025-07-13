import { contentQueries } from './queries/content';
import { eventQueries } from './queries/event';
import { userQueries } from './queries/user';
import { configQueries } from './queries/config';
import { locationQueries } from './queries/location';

import { userMutations } from './mutations/user';
import { eventMutations } from './mutations/event';
import { typeResolvers } from './types';

export const resolvers = {
  Query: {
    ...contentQueries,
    ...configQueries,
    ...eventQueries,
    ...userQueries,
    ...locationQueries,
  },
  Mutation: {
    ...userMutations,
    ...eventMutations,
  },
  ...typeResolvers,
};
