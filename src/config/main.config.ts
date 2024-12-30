import { registerAs } from '@nestjs/config';
import ms from 'ms';

const {
  NODE_ENV: nodeEnv = 'development',
  PORT: port = '4000',
  FRONTEND_URL: frontendUrl,
  EMAIL_VERIFICATION_URL: emailVerificationUrl,
  RESET_PASSWORD_URL: resetPasswordUrl,
  DEFAULT_LANGUAGE: defaultLanguage = 'en',
  EMAIL_VERIFICATION_EXPIRATION: emailVerificationExpiration = '1d',
  RESET_PASSWORD_EXPIRATION: resetPasswordExpiration = '1h',
} = process.env;

if (!frontendUrl || !emailVerificationUrl || !resetPasswordUrl) {
  throw new Error('Missing main configuration');
}

export default registerAs('main', () => ({
  isProduction: nodeEnv === 'production',
  isDevelopment: nodeEnv === 'development',
  isTest: nodeEnv === 'test',
  nodeEnv,
  port: parseInt(port, 10),
  frontendUrl,
  defaultLanguage,
  emailVerificationUrl,
  emailVerificationExpiration: ms(emailVerificationExpiration),
  resetPasswordUrl,
  resetPasswordExpiration: ms(resetPasswordExpiration),
}));
