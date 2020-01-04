import { createAction, createReducer } from '@reduxjs/toolkit';

interface UserState {
  accessToken: string;
  refreshToken: string;
}

interface AuthenticatePayload {
  accessToken: string;
  refreshToken: string;
}

const INITIAL_STATE = {} as UserState;

const authenticate = createAction<AuthenticatePayload>('AUTHENTICATED');
const logout = createAction<void>('LOGGED_OUT');
const reducer = createReducer(INITIAL_STATE, builder =>
  builder
    .addCase(authenticate, (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    })
    .addCase(logout, () => {
      return INITIAL_STATE;
    }),
);

export const actions = { authenticate, logout };
export default reducer;
