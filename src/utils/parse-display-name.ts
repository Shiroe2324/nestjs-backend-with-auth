import limitsConfig from '@/config/limits.config';

const { minDisplayNameLength, maxDisplayNameLength } = limitsConfig();

export const parseDisplayName = (displayName: string) => {
  let name: string | null = displayName;

  if (name.length < minDisplayNameLength) {
    name = null;
  } else if (name.length > maxDisplayNameLength) {
    name = name.slice(0, maxDisplayNameLength);
  }

  return name;
};
