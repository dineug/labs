import { effect } from '@vue/reactivity';
import { noop } from 'lodash-es';
import { all, delay, put, takeEvery } from 'redux-saga/effects';

import { createAction, createStore } from '@/store';
import { createSaga } from '@/store/saga';

interface State {
  value: number;
}

interface ActionMap {
  INCREMENT: null;
  INCREMENT_ASYNC: null;
}

function* incrementAsync() {
  yield delay(1000);
  yield put({ type: 'INCREMENT' });
}

function* watchIncrementAsync() {
  yield takeEvery('INCREMENT_ASYNC', incrementAsync);
}

function* rootSaga() {
  yield all([watchIncrementAsync()]);
}

const counter = createStore<State, ActionMap>({
  state: {
    value: 0,
  },
  reducers: {
    INCREMENT: state => state.value++,
    INCREMENT_ASYNC: noop,
  },
});

createSaga(counter, rootSaga);

effect(() => {
  console.log(counter.state.value);
  counter.dispatch(
    createAction<'INCREMENT_ASYNC', ActionMap>('INCREMENT_ASYNC', null)
  );
});
