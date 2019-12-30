import { SetMetadata } from '@nestjs/common';

export interface DecoratorElems {
  category: 'realm-management';
  role: 'manage-users';
}

export const Roles = (...args: DecoratorElems[]) => SetMetadata('roles', args);
