import { reactive } from '@vue/reactivity';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export type Action<K extends keyof M, M> = {
  type: K;
  payload: M[K];
  timestamp: number;
};

type RecursionGenerator<T> = Generator<T | RecursionGenerator<T>>;

export type GeneratorActions<K extends keyof M, M> = Array<
  Action<K, M> | RecursionGenerator<Action<K, M>>
>;

export type Reducer<S, K extends keyof M, M> = (
  state: S,
  payload: Action<K, M>['payload']
) => void;

type ReducerRecord<S, K extends keyof M, M> = {
  [P in K]: Reducer<S, P, M>;
};

type Options<S, M> = {
  state: S;
  reducers: ReducerRecord<S, keyof M, M>;
};

export type Store<S, M> = {
  state: S;
  dispatch(...actions: GeneratorActions<keyof M, M>): void;
  dispatchSync(...actions: GeneratorActions<keyof M, M>): void;
  beforeDispatch$: Observable<Array<Action<keyof M, M>>>;
  dispatch$: Observable<Array<Action<keyof M, M>>>;
  destroy(): void;
};

export function createAction<K extends keyof M, M>(
  type: K,
  payload: Action<K, M>['payload']
): Action<K, M> {
  return {
    type,
    payload,
    timestamp: Date.now(),
  };
}

export const notEmptyActions = filter(<M>(actions: Array<Action<keyof M, M>>) =>
  Boolean(actions.length)
);

function* flat<T>(iterator: any[]): Generator<T> {
  for (const value of iterator) {
    if (value && value[Symbol.iterator]) yield* flat(value);
    else yield value;
  }
}

export function createStore<S extends object, M>({
  state: initialState,
  reducers,
}: Options<S, M>): Store<S, M> {
  const state = reactive(initialState);
  const beforeDispatch$ = new Subject<Array<Action<keyof M, M>>>();
  const dispatch$ = new Subject<Array<Action<keyof M, M>>>();

  const runReducer = (action: Action<keyof M, M>) => {
    try {
      const reducer = reducers[action.type];
      reducer(state as S, action.payload);
    } catch (e) {
      window.console.error(e);
    }
  };

  const dispatchSync = (...generatorActions: GeneratorActions<keyof M, M>) => {
    const actions = [...flat<Action<keyof M, M>>(generatorActions)];
    beforeDispatch$.next(actions);
    actions.forEach(runReducer);
    dispatch$.next(actions);
  };

  const dispatch = (...generatorActions: GeneratorActions<keyof M, M>) => {
    queueMicrotask(() => dispatchSync(...generatorActions));
  };

  const destroy = () => {
    beforeDispatch$.unsubscribe();
    dispatch$.unsubscribe();
  };

  return {
    state: state as S,
    dispatch,
    dispatchSync,
    beforeDispatch$: beforeDispatch$.pipe(notEmptyActions),
    dispatch$: dispatch$.pipe(notEmptyActions),
    destroy,
  };
}
