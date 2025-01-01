import { registerAs } from '@nestjs/config';

import { databaseSchema } from '@/schemas/database.schema';

const envVars = databaseSchema.validate(process.env, { allowUnknown: true, abortEarly: false, stripUnknown: true });

if (envVars.error) {
  throw new Error(`Database configuration validation error: ${envVars.error.message}`);
}

export default registerAs('database', () => ({
  host: envVars.value.DATABASE_HOST,
  port: envVars.value.DATABASE_PORT,
  name: envVars.value.DATABASE_NAME,
  username: envVars.value.DATABASE_USERNAME,
  password: envVars.value.DATABASE_PASSWORD,
}));
