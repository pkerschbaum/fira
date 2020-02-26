import { useDispatch } from 'react-redux';

export const useActionsWithDispatch = <T extends {}>(actions: T) => {
  // use type "Dispatch" just to clarify that dispatching is automatically done
  type Dispatch<FuncType> = FuncType;

  type DispatchType = {
    [P in keyof typeof actions]: Dispatch<typeof actions[P]>;
  };

  const dispatch = useDispatch<any>();

  const actionsWithDispatch: any = {};

  for (const action in actions) {
    if (actions.hasOwnProperty(action)) {
      actionsWithDispatch[action] = (...args: any[]) => dispatch((actions as any)[action](...args));
    }
  }

  return actionsWithDispatch as DispatchType;
};
