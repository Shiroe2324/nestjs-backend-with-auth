import { registerAs } from '@nestjs/config';

import { jwtSchema } from '@/schemas/jwt.schema';

const envVars = jwtSchema.validate(process.env, { allowUnknown: true, abortEarly: false, stripUnknown: true });

if (envVars.error) {
  throw new Error(`JWT configuration validation error: ${envVars.error.message}`);
}

export default registerAs('jwt', () => ({
  accessSecret: envVars.value.JWT_ACCESS_SECRET,
  accessExpiration: envVars.value.JWT_ACCESS_EXPIRATION,
  refreshSecret: envVars.value.JWT_REFRESH_SECRET,
  refreshExpiration: envVars.value.JWT_REFRESH_EXPIRATION,
}));
