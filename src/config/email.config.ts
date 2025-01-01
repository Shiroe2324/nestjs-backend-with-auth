import { registerAs } from '@nestjs/config';

import { emailSchema } from '@/schemas/email.schema';

const envVars = emailSchema.validate(process.env, { allowUnknown: true, abortEarly: false, stripUnknown: true });

if (envVars.error) {
  throw new Error(`Email configuration validation error: ${envVars.error.message}`);
}

export default registerAs('email', () => ({
  host: envVars.value.EMAIL_HOST,
  port: envVars.value.EMAIL_PORT,
  secure: envVars.value.EMAIL_SECURE,
  username: envVars.value.EMAIL_USERNAME,
  password: envVars.value.EMAIL_PASSWORD,
  from: envVars.value.EMAIL_FROM,
}));
