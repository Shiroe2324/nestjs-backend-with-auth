import Joi from 'joi';

import { DatabaseConfig } from '@/types/schemas';

export const databaseSchema = Joi.object<DatabaseConfig>({
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
});
