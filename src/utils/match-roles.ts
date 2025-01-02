import { Role } from '@/entities/role.entity';
import { Roles } from '@/enums/roles.enum';

export const matchRoles = (requiredRoles: Roles[], userRoles: Role[]) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  const userRoleNames = userRoles.map((role) => role.name);
  return requiredRoles.some((requiredRole) => userRoleNames.includes(requiredRole));
};
