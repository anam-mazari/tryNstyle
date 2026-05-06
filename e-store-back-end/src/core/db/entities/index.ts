import { EntitySchema } from 'typeorm';
import { User } from './user.entity';
import { CartItem } from './cart';
import { product } from './product';
import { Admin } from './admin';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { PendingCheckout } from './pending-checkout.entity';

type EntityClassOrSchema = Function | EntitySchema<any>;
export const entities: EntityClassOrSchema[] = [
  User,
  CartItem,
  product,
  Admin,
  Order,
  OrderItem,
  Payment,
  Category,
  Brand,
  PendingCheckout,
];
