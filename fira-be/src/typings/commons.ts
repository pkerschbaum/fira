export type JwtPayload = {
  preferred_username?: string;
  exp: number;
  resource_access?: {
    'realm-management'?: {
      roles?: Array<'manage-users'>;
    };
  };
};
