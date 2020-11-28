import { combineReducers } from '@reduxjs/toolkit';

import { reducer as userReducer } from './user/user.slice';
import { reducer as annotationReducer } from './annotation/annotation.slice';

export default combineReducers({
  user: userReducer,
  annotation: annotationReducer,
});
