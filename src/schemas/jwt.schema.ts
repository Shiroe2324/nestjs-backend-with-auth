import Joi from 'joi';

import { JwtConfig } from '@/types/schemas';

export const jwtSchema = Joi.object<JwtConfig>({
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRATION: Joi.string().default('1h'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
});
