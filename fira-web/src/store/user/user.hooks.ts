import { useSelector } from 'react-redux';

import { RootState } from '../store';
import { UserRole } from './user.slice';
import { assertUnreachable } from '../../util/types.util';
import { actions } from './user.slice';
import { useActionsWithDispatch } from '../util/actions.util';

export function useUserState() {
  const userRole = useSelector((state: RootState) => {
    if (!state.user) {
      return undefined;
    } else if (state.user.role === UserRole.ADMIN || state.user.role === UserRole.ANNOTATOR) {
      return state.user.role;
    } else {
      assertUnreachable(state.user.role);
    }
  });

  return { userRole };
}

export const useUserActions = () => useActionsWithDispatch(actions);
