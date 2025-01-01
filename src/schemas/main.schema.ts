import Joi from 'joi';

import { MainConfig } from '@/types/schemas';

export const mainSchema = Joi.object<MainConfig>({
  NODE_ENV: Joi.string().valid('development', 'production', 'test', 'provision').default('development'),
  PORT: Joi.number().default(4000),
  FRONTEND_URL: Joi.string().uri().required(),
  DEFAULT_LANGUAGE: Joi.string().default('en'),
  EMAIL_VERIFICATION_URL: Joi.string().uri().required(),
  EMAIL_VERIFICATION_EXPIRATION: Joi.alternatives(Joi.number(), Joi.string()).default('1d'),
  RESET_PASSWORD_URL: Joi.string().uri().required(),
  RESET_PASSWORD_EXPIRATION: Joi.alternatives(Joi.number(), Joi.string()).default('1h'),
});
