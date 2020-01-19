import { createAction, createReducer } from '@reduxjs/toolkit';
import * as jwt from 'jsonwebtoken';

import { JwtPayload } from '../../typings/typings';

type UserState = null | {
  readonly accessToken: {
    readonly val: string;
    readonly expiry: number; // unix timestamp
  };
  readonly refreshToken: {
    readonly val: string;
    readonly expiry: number; // unix timestamp
  };
  readonly role: UserRole;
};

export enum UserRole {
  ANNOTATOR = 'ANNOTATOR',
  ADMIN = 'ADMIN',
}

type AuthenticatePayload = {
  accessToken: string;
  refreshToken: string;
};

const INITIAL_STATE = null as UserState;

const authenticate = createAction<AuthenticatePayload>('AUTHENTICATED');
const logout = createAction<void>('LOGGED_OUT');
const reducer = createReducer(INITIAL_STATE, builder =>
  builder
    .addCase(authenticate, (state, action) => {
      const accessTokenJwtPayload = jwt.decode(action.payload.accessToken) as JwtPayload;
      const refreshTokenJwtPayload = jwt.decode(action.payload.refreshToken) as JwtPayload;
      const isAdmin = !!accessTokenJwtPayload.resource_access?.['realm-management']?.roles?.some(
        role => role === 'manage-users',
      );

      return {
        ...state,
        accessToken: {
          val: action.payload.accessToken,
          expiry: accessTokenJwtPayload.exp,
        },
        refreshToken: {
          val: action.payload.refreshToken,
          expiry: refreshTokenJwtPayload.exp,
        },
        role: isAdmin ? UserRole.ADMIN : UserRole.ANNOTATOR,
      };
    })
    .addCase(logout, () => {
      return INITIAL_STATE;
    }),
);

export const actions = { authenticate, logout };
export default reducer;
