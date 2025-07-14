import { call, put, take, takeLatest } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { setInitialData, addLiveData, setError, setLoading } from './t1Slice';
import { T1DataPoint } from './t1Slice';

function fetchT1History(): Promise<T1DataPoint[]> {
    return fetch('/api/t1-history').then((res) => res.json());
}

function createWebSocketChannel() {
    return eventChannel<T1DataPoint>((emitter) => {
        const ws = new WebSocket('ws://localhost:4000/t1');
        ws.onmessage = (event) => {
            const parsed: T1DataPoint = JSON.parse(event.data);
            emitter(parsed);
        };
        ws.onerror = (e) => console.error('WebSocket error', e);
        return () => ws.close();
    });
}

function* loadingInitialData() {
    try {
        yield put(setLoading(true));
        const data: T1DataPoint[] = yield call(fetchT1History);
        yield put(setInitialData(data))
    } catch (err: any) {
        yield put(setError(err.message));
    } finally {
        yield put(setLoading(false));
    }
}

function* listenForLiveData() {
    const channel = yield call(createWebSocketChannel);
    while (true) {
        const data: T1DataPoint = yield take(channel);
        yield put(addLiveData(data));
    }
}

export function* t1Saga() {
    yield call(loadingInitialData);
    yield call(listenForLiveData);
}