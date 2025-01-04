import { Order, OrderBy } from '@/enums/find-all-users.enum';

export interface FindAllUsersOptions {
  page: number;
  limit: number;
  order: Order;
  orderBy: OrderBy;
}
