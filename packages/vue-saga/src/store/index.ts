import { reactive } from '@vue/reactivity';
import { Observable, Subject } from 'rxjs';

export type Action<S> = (state: S, payload: any) => void;

type StoreOptions<S> = {
  state: S;
  actions: Record<string, Action<S>>;
};

export type CommandType = {
  type: string;
  payload: any;
};

export type Store<S> = {
  state: S;
  dispatch(command: CommandType): void;
  beforeDispatch$: Observable<CommandType>;
  dispatch$: Observable<CommandType>;
  destroy(): void;
};

export function createStore<S extends object>({
  state: initialState,
  actions,
}: StoreOptions<S>): Store<S> {
  const state = reactive(initialState) as S;
  const beforeDispatch$ = new Subject<CommandType>();
  const dispatch$ = new Subject<CommandType>();

  const runAction = (command: CommandType) => {
    try {
      const action = actions[command.type];
      action?.(state, command.payload);
    } catch (e) {
      console.error(e);
    }
  };

  const dispatch = (command: CommandType) => {
    beforeDispatch$.next(command);
    runAction(command);
    dispatch$.next(command);
  };

  const destroy = () => {
    beforeDispatch$.unsubscribe();
    dispatch$.unsubscribe();
  };

  return {
    state,
    dispatch,
    dispatch$,
    beforeDispatch$,
    destroy,
  };
}

export function createCommand(type: string): CommandType;
export function createCommand<T>(type: string, payload: T): CommandType;
export function createCommand<T>(type: string, payload?: T): CommandType {
  return {
    type,
    payload,
  };
}
