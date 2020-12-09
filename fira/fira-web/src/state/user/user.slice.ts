import { createAction, createReducer } from '@reduxjs/toolkit';
import * as jwt from 'jsonwebtoken';

import { assertUnreachable, JwtPayload } from '@fira-commons';
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

export const actions = {
  authenticate: createAction<AuthenticatePayload>('AUTHENTICATED'),
  acknowledgePage: createAction<AcknowledgePagePayload>('ACKNOWLEDGED_PAGE'),
  logout: createAction<void>('LOGGED_OUT'),
};
export const reducer = createReducer(INITIAL_STATE, (builder) =>
  builder
    .addCase(actions.authenticate, (state, action) => {
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
    .addCase(actions.acknowledgePage, (state, action) => {
      if (action.payload.page === 'INFO') {
        state!.acknowledgedInfoPage = true;
      } else if (action.payload.page === 'FINISHED') {
        state!.acknowledgedFinishedPage = true;
      } else {
        assertUnreachable(action.payload.page);
      }
    })
    .addCase(actions.logout, () => {
      return INITIAL_STATE;
    }),
);
