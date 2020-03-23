import { createAction, createReducer } from '@reduxjs/toolkit';
import * as jwt from 'jsonwebtoken';

import { JwtPayload } from '../../typings/fira-be-typings';
import { UserRole } from '../../typings/enums';

type UserState = null | {
  readonly accessToken: {
    readonly val: string;
    readonly expiry: number; // unix timestamp
  };
  readonly refreshToken: {
    readonly val: string;
    readonly expiry: number; // unix timestamp
  };
  readonly acknowledgedInfoPage: boolean;
  readonly role: UserRole;
};

type AuthenticatePayload = {
  accessToken: string;
  refreshToken: string;
};
type AckInfoPagePayload = {
  acknowledgedInfoPage: boolean;
};

const INITIAL_STATE = null as UserState;
const DEFAULT_ACKNOWLEDGED_INFO_PAGE = false;

const authenticate = createAction<AuthenticatePayload>('AUTHENTICATED');
const acknowledgeInfoPage = createAction<AckInfoPagePayload>('ACKNOWLEDGED_INFO_PAGE');
const logout = createAction<void>('LOGGED_OUT');
const reducer = createReducer(INITIAL_STATE, (builder) =>
  builder
    .addCase(authenticate, (state, action) => {
      const accessTokenJwtPayload = jwt.decode(action.payload.accessToken) as JwtPayload;
      const refreshTokenJwtPayload = jwt.decode(action.payload.refreshToken) as JwtPayload;
      const isAdmin = !!accessTokenJwtPayload.resource_access?.['realm-management']?.roles?.some(
        (role) => role === 'manage-users',
      );

      const acknowledgedInfoPage = state?.acknowledgedInfoPage ?? DEFAULT_ACKNOWLEDGED_INFO_PAGE;

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
        acknowledgedInfoPage,
        role: isAdmin ? UserRole.ADMIN : UserRole.ANNOTATOR,
      };
    })
    .addCase(acknowledgeInfoPage, (state, action) => {
      state!.acknowledgedInfoPage = action.payload.acknowledgedInfoPage;
    })
    .addCase(logout, () => {
      return INITIAL_STATE;
    }),
);

export const actions = { authenticate, acknowledgeInfoPage, logout };
export default reducer;
