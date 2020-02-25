import { combineReducers } from '@reduxjs/toolkit';

import userReducer from './user/user.slice';
import annotationReducer from './annotation/annotation.slice';

export default combineReducers({
  user: userReducer,
  annotation: annotationReducer,
});
