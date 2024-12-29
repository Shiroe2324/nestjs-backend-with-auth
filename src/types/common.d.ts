import { Order, OrderBy } from '@/enums/find-all-users.enum';

export interface AuthJwtPayload {
  sub: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface FindAllUsersOptions {
  page?: number;
  limit?: number;
  order?: Order;
  orderBy?: OrderBy;
}
