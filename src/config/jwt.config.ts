import { registerAs } from '@nestjs/config';
import ms from 'ms';

const {
  JWT_ACCESS_SECRET: accessSecret,
  JWT_ACCESS_EXPIRATION: accessExpiration = '1h',
  JWT_REFRESH_SECRET: refreshSecret,
  JWT_REFRESH_EXPIRATION: refreshExpiration = '7d',
} = process.env;

if (!accessSecret || !refreshSecret) {
  throw new Error('Missing JWT configuration');
} else if (ms(accessExpiration) > ms(refreshExpiration)) {
  throw new Error('JWT access token expiration must be less than refresh token expiration');
}

export default registerAs('jwt', () => ({
  accessSecret,
  accessExpiration,
  refreshSecret,
  refreshExpiration,
}));
