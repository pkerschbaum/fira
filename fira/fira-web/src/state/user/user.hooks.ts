import { useSelector } from 'react-redux';

import { RootState } from '../store';
import { actions } from './user.slice';
import { useActionsWithDispatch } from '../util/actions.util';
import { UserRole } from '../../typings/enums';
import { assertUnreachable } from '@fira-commons';

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
  const userAcknowledgedInfoPage = useSelector((state: RootState) => {
    return !!state.user?.acknowledgedInfoPage;
  });
  const userAcknowledgedFinishedPage = useSelector((state: RootState) => {
    return !!state.user?.acknowledgedFinishedPage;
  });

  return { userRole, userAcknowledgedInfoPage, userAcknowledgedFinishedPage };
}

export const useUserActions = () => useActionsWithDispatch(actions);
