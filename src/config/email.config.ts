import { registerAs } from '@nestjs/config';

const {
  EMAIL_HOST: host,
  EMAIL_PORT: port,
  EMAIL_SECURE: secure = 'true',
  EMAIL_USERNAME: username,
  EMAIL_PASSWORD: password,
  EMAIL_FROM: from,
} = process.env;

if (!host || !port || !username || !password || !from) {
  throw new Error('Missing email configuration');
}

export default registerAs('email', () => ({
  host,
  port: parseInt(port, 10),
  secure: secure === 'true',
  username,
  password,
  from,
}));
