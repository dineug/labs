import { effect } from '@vue/reactivity';
import { all, delay, put, takeEvery } from 'redux-saga/effects';

import { createCommand, createStore } from '@/store';
import { createSaga } from '@/store/saga';

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

const counter = createStore({
  state: {
    value: 0,
  },
  actions: {
    INCREMENT: state => state.value++,
  },
});

createSaga(counter, rootSaga);

effect(() => {
  console.log(counter.state.value);
  counter.dispatch(createCommand('INCREMENT_ASYNC'));
});
