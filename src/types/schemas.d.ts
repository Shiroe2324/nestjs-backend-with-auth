export interface CloudinaryConfig {
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

export interface DatabaseConfig {
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_NAME: string;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
}

export interface EmailConfig {
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_SECURE: boolean;
  EMAIL_USERNAME: string;
  EMAIL_PASSWORD: string;
  EMAIL_FROM: string;
}

export interface GoogleConfig {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  GOOGLE_REDIRECT_URL: string;
}

export interface JwtConfig {
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRATION: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRATION: string;
}

export interface LimitsConfig {
  MIN_USERNAME_LENGTH: number;
  MAX_USERNAME_LENGTH: number;
  MIN_PASSWORD_LENGTH: number;
  MAX_PASSWORD_LENGTH: number;
  MIN_DISPLAY_NAME_LENGTH: number;
  MAX_DISPLAY_NAME_LENGTH: number;
  MAX_FILE_SIZE: number;
  MAX_FIND_ALL_LIMIT: number;
}

export interface MainConfig {
  NODE_ENV: 'production' | 'development' | 'test' | 'provision';
  PORT: number;
  FRONTEND_URL: string;
  DEFAULT_LANGUAGE: string;
  EMAIL_VERIFICATION_URL: string;
  EMAIL_VERIFICATION_EXPIRATION: number | string;
  RESET_PASSWORD_URL: string;
  RESET_PASSWORD_EXPIRATION: number | string;
}
