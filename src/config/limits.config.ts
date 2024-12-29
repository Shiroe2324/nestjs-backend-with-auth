import { registerAs } from '@nestjs/config';

const {
  MIN_USERNAME_LENGTH: minUsernameLength = '3',
  MAX_USERNAME_LENGTH: maxUsernameLength = '36',
  MIN_PASSWORD_LENGTH: minPasswordLength = '6',
  MAX_PASSWORD_LENGTH: maxPasswordLength = '36',
  MIN_DISPLAY_NAME_LENGTH: minDisplayNameLength = '3',
  MAX_DISPLAY_NAME_LENGTH: maxDisplayNameLength = '50',
  MAX_FILE_SIZE: maxFileSize = '4',
} = process.env;

if (parseInt(minUsernameLength, 10) > parseInt(maxUsernameLength, 10)) {
  throw new Error('Minimum username length cannot be greater than maximum username length');
} else if (parseInt(minPasswordLength, 10) > parseInt(maxPasswordLength, 10)) {
  throw new Error('Minimum password length cannot be greater than maximum password length');
} else if (parseInt(minDisplayNameLength, 10) > parseInt(maxDisplayNameLength, 10)) {
  throw new Error('Minimum display name length cannot be greater than maximum display name length');
} else if (parseInt(minUsernameLength, 10) > 12 || parseInt(maxUsernameLength, 10) < 12) {
  throw new Error('Username length must be between 3 and 36 characters');
} else if (parseInt(maxFileSize, 10) < 1) {
  throw new Error('Maximum file size must be at least 1 MB');
}

export default registerAs('limits', () => ({
  minUsernameLength: parseInt(minUsernameLength, 10),
  maxUsernameLength: parseInt(maxUsernameLength, 10),
  minPasswordLength: parseInt(minPasswordLength, 10),
  maxPasswordLength: parseInt(maxPasswordLength, 10),
  minDisplayNameLength: parseInt(minDisplayNameLength, 10),
  maxDisplayNameLength: parseInt(maxDisplayNameLength, 10),
  maxFileSize: parseInt(maxFileSize, 10),
}));
