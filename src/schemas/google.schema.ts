import Joi from 'joi';

import { GoogleConfig } from '@/types/schemas';

export const googleSchema = Joi.object<GoogleConfig>({
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),
  GOOGLE_REDIRECT_URL: Joi.string().uri().required(),
});
