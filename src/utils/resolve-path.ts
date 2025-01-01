import { join } from 'path';

export const resolvePath = (relativePath: string) => {
  return join(__dirname, '..', relativePath);
};
