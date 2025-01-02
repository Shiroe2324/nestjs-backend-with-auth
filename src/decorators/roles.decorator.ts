import { Reflector } from '@nestjs/core';

import { Roles } from '@/enums/roles.enum';

export const RequiredRoles = Reflector.createDecorator<Roles[]>();
