import Joi from 'joi';

import { EmailConfig } from '@/types/schemas';

export const emailSchema = Joi.object<EmailConfig>({
  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().required(),
  EMAIL_SECURE: Joi.boolean().default(true),
  EMAIL_USERNAME: Joi.string().required(),
  EMAIL_PASSWORD: Joi.string().required(),
  EMAIL_FROM: Joi.string().email().required(),
});
