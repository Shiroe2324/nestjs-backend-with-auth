import { registerAs } from '@nestjs/config';

import { limitsSchema } from '@/schemas/limits.schema';

const envVars = limitsSchema.validate(process.env, { allowUnknown: true, abortEarly: false, stripUnknown: true });

if (envVars.error) {
  throw new Error(`Limits configuration validation error: ${envVars.error.message}`);
}

export default registerAs('limits', () => ({
  minUsernameLength: envVars.value.MIN_USERNAME_LENGTH,
  maxUsernameLength: envVars.value.MAX_USERNAME_LENGTH,
  minPasswordLength: envVars.value.MIN_PASSWORD_LENGTH,
  maxPasswordLength: envVars.value.MAX_PASSWORD_LENGTH,
  minDisplayNameLength: envVars.value.MIN_DISPLAY_NAME_LENGTH,
  maxDisplayNameLength: envVars.value.MAX_DISPLAY_NAME_LENGTH,
  maxFileSize: envVars.value.MAX_FILE_SIZE,
  maxFindAllLimit: envVars.value.MAX_FIND_ALL_LIMIT,
}));
