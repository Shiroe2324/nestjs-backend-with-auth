import { registerAs } from '@nestjs/config';

import { googleSchema } from '@/schemas/google.schema';

const envVars = googleSchema.validate(process.env, { allowUnknown: true, abortEarly: false, stripUnknown: true });

if (envVars.error) {
  throw new Error(`Google configuration validation error: ${envVars.error.message}`);
}

export default registerAs('google', () => ({
  clientId: envVars.value.GOOGLE_CLIENT_ID,
  clientSecret: envVars.value.GOOGLE_CLIENT_SECRET,
  callbackUrl: envVars.value.GOOGLE_CALLBACK_URL,
  redirectUrl: envVars.value.GOOGLE_REDIRECT_URL,
}));
