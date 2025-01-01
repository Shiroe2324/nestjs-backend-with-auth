import Joi from 'joi';

import { CloudinaryConfig } from '@/types/schemas';

export const cloudinarySchema = Joi.object<CloudinaryConfig>({
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
});
