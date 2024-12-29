import { registerAs } from '@nestjs/config';

const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = process.env;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error('Missing cloudinary configuration');
}

export default registerAs('cloudinary', () => ({
  cloudName,
  apiKey,
  apiSecret,
}));
