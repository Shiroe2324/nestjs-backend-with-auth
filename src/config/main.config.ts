import { registerAs } from '@nestjs/config';
import ms from 'ms';

import { mainSchema } from '@/schemas/main.schema';

const envVars = mainSchema.validate(process.env, { allowUnknown: true, abortEarly: false, stripUnknown: true });

if (envVars.error) {
  throw new Error(`Main configuration validation error: ${envVars.error.message}`);
}

export default registerAs('main', () => ({
  isProduction: envVars.value.NODE_ENV === 'production',
  isDevelopment: envVars.value.NODE_ENV === 'development',
  isTest: envVars.value.NODE_ENV === 'test',
  isProvision: envVars.value.NODE_ENV === 'provision',
  nodeEnv: envVars.value.NODE_ENV,
  port: envVars.value.PORT,
  frontendUrl: envVars.value.FRONTEND_URL,
  defaultLanguage: envVars.value.DEFAULT_LANGUAGE,
  emailVerificationUrl: envVars.value.EMAIL_VERIFICATION_URL,
  emailVerificationExpiration: ms(String(envVars.value.EMAIL_VERIFICATION_EXPIRATION)),
  resetPasswordUrl: envVars.value.RESET_PASSWORD_URL,
  resetPasswordExpiration: ms(String(envVars.value.RESET_PASSWORD_EXPIRATION)),
}));
