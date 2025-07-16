import { call, put, take, fork, delay } from 'redux-saga/effects';
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
    const channel:[] = yield call(createWebSocketChannel);
    const buffer: T1DataPoint[] = [];

    while (true) {
        const data: T1DataPoint = yield take(channel);
        buffer.push(data);

        if(buffer.length === 1){
            yield fork(processBatchEvery, buffer, 10000);
        }
        // yield put(addLiveData(data));
    }
}

function* processBatchEvery(buffer: T1DataPoint[], intervalMs: number) {
    while(true) {
        yield delay(intervalMs);

        if(buffer.length > 0) {
            const batch = [...buffer];
            buffer.length = 0;

            for(const point of batch) {
                yield put(addLiveData(point));
            }
        }
    }
}

export function* t1Saga() {
    yield call(loadingInitialData);
    yield call(listenForLiveData);
}