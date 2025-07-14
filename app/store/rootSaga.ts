import { all } from 'redux-saga/effects';
import { t1Saga } from './t1Sagas';

export default function* rootSaga() {
    yield all([t1Saga()]);
}