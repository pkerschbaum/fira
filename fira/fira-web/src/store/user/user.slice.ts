import { createAction, createReducer } from '@reduxjs/toolkit';
import * as jwt from 'jsonwebtoken';

import { JwtPayload } from '../../../../commons';
import { UserRole } from '../../typings/enums';
import { assertUnreachable } from '../../util/types.util';

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
  readonly acknowledgedFinishedPage: boolean;
  readonly role: UserRole;
};

type AuthenticatePayload = {
  accessToken: string;
  refreshToken: string;
};
type AcknowledgePagePayload = {
  page: 'INFO' | 'FINISHED';
};

const INITIAL_STATE = null as UserState;
const DEFAULT_ACKNOWLEDGED_INFO_PAGE = false;
const DEFAULT_ACKNOWLEDGED_FINISHED_PAGE = false;

const authenticate = createAction<AuthenticatePayload>('AUTHENTICATED');
const acknowledgePage = createAction<AcknowledgePagePayload>('ACKNOWLEDGED_PAGE');
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
      const acknowledgedFinishedPage =
        state?.acknowledgedFinishedPage ?? DEFAULT_ACKNOWLEDGED_FINISHED_PAGE;

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
        acknowledgedFinishedPage,
        role: isAdmin ? UserRole.ADMIN : UserRole.ANNOTATOR,
      };
    })
    .addCase(acknowledgePage, (state, action) => {
      if (action.payload.page === 'INFO') {
        state!.acknowledgedInfoPage = true;
      } else if (action.payload.page === 'FINISHED') {
        state!.acknowledgedFinishedPage = true;
      } else {
        assertUnreachable(action.payload.page);
      }
    })
    .addCase(logout, () => {
      return INITIAL_STATE;
    }),
);

export const actions = { authenticate, acknowledgePage, logout };
export default reducer;
