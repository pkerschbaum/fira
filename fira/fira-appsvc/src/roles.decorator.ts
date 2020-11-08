import { SetMetadata } from '@nestjs/common';

export type DecoratorElems = {
  category: 'realm-management';
  role: 'manage-users';
};

export const Roles = (...args: DecoratorElems[]) => SetMetadata('roles', args);
