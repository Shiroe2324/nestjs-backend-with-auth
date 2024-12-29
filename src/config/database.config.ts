import { registerAs } from '@nestjs/config';

const { DATABASE_HOST: host, DATABASE_PORT: port, DATABASE_NAME: name, DATABASE_USERNAME: username, DATABASE_PASSWORD: password } = process.env;

if (!host || !port || !name || !username || !password) {
  throw new Error('Missing database configuration');
}

export default registerAs('database', () => ({
  host,
  port: parseInt(port, 10),
  name,
  username,
  password,
}));
