import { registerAs } from '@nestjs/config';

import { cloudinarySchema } from '@/schemas/cloudinary.schema';

const envVars = cloudinarySchema.validate(process.env, { allowUnknown: true, abortEarly: false, stripUnknown: true });

if (envVars.error) {
  throw new Error(`Cloudinary configuration validation error: ${envVars.error.message}`);
}

export default registerAs('cloudinary', () => ({
  cloudName: envVars.value.CLOUDINARY_CLOUD_NAME,
  apiKey: envVars.value.CLOUDINARY_API_KEY,
  apiSecret: envVars.value.CLOUDINARY_API_SECRET,
}));
