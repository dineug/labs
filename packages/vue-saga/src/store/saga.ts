import { SAGA_ACTION } from '@redux-saga/symbols';
import { runSaga, stdChannel } from 'redux-saga';

import { CommandType, Store } from '@/store';

export function createSaga<S>(
  { state, dispatch, dispatch$ }: Store<S>,
  saga: () => Iterator<any>
) {
  const channel = stdChannel<CommandType>();
  const sagaIO = {
    channel,
    dispatch(command: CommandType) {
      Reflect.get(command, SAGA_ACTION) && dispatch(command);
      channel.put(command);
    },
    getState: () => state,
  };
  const task = runSaga(sagaIO, saga);

  const subscription = dispatch$.subscribe(
    command => !Reflect.get(command, SAGA_ACTION) && sagaIO.dispatch(command)
  );

  const destroy = () => {
    subscription.unsubscribe();
    task.cancel();
  };

  return {
    dispatch: sagaIO.dispatch,
    destroy,
  };
}
