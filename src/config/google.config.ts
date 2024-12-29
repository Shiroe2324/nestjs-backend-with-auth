import { registerAs } from '@nestjs/config';

const {
  GOOGLE_CLIENT_ID: clientId,
  GOOGLE_CLIENT_SECRET: clientSecret,
  GOOGLE_CALLBACK_URL: callbackUrl,
  GOOGLE_REDIRECT_URL: redirectUrl,
} = process.env;

if (!clientId || !clientSecret || !callbackUrl || !redirectUrl) {
  throw new Error('Missing Google configuration');
}

export default registerAs('google', () => ({
  clientId,
  clientSecret,
  callbackUrl,
  redirectUrl,
}));
