import Joi from 'joi';

import { LimitsConfig } from '@/types/schemas';

export const limitsSchema = Joi.object<LimitsConfig>({
  MIN_USERNAME_LENGTH: Joi.number().positive().default(3),
  MAX_USERNAME_LENGTH: Joi.number().min(Joi.ref('MIN_USERNAME_LENGTH')).default(36),
  MIN_PASSWORD_LENGTH: Joi.number().positive().default(6),
  MAX_PASSWORD_LENGTH: Joi.number().min(Joi.ref('MIN_PASSWORD_LENGTH')).default(36),
  MIN_DISPLAY_NAME_LENGTH: Joi.number().positive().default(3),
  MAX_DISPLAY_NAME_LENGTH: Joi.number().min(Joi.ref('MIN_DISPLAY_NAME_LENGTH')).default(50),
  MAX_FILE_SIZE: Joi.number().positive().default(4),
  MAX_FIND_ALL_LIMIT: Joi.number().positive().default(100),
});
