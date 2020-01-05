import { createAction, createReducer } from '@reduxjs/toolkit';
import * as jwt from 'jsonwebtoken';

import { JwtPayload } from '../typings';

type UserState = null | {
  accessToken: {
    val: string;
    expiry: number; // unix timestamp
  };
  refreshToken: {
    val: string;
    expiry: number; // unix timestamp
  };
  role: 'annotator' | 'admin';
};

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
        role: isAdmin ? 'admin' : 'annotator',
      };
    })
    .addCase(logout, () => {
      return INITIAL_STATE;
    }),
);

export const actions = { authenticate, logout };
export default reducer;
