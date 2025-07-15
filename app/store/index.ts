import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { createWrapper, MakeStore } from "next-redux-wrapper";
import rootReducer from './rootReducer';
import rootSaga from './rootSaga';

export function makeStore() {
    const sagaMiddleWare = createSagaMiddleware();
    const store = configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ thunk: false }).concat(sagaMiddleWare),
    });

    //   applyMiddleware(sagaMiddleWare);
  sagaMiddleWare.run(rootSaga);

    return store;
}

export const wrapper = createWrapper(makeStore);

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<ReturnType<typeof makeStore>['getState']>;
// export type AppDispatch = AppStore['dispatch'];
