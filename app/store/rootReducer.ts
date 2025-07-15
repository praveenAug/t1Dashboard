import { combineReducers } from "@reduxjs/toolkit";
import t1Reducer from './t1Slice';

const rootReducer = combineReducers({
    t1: t1Reducer,
});

export default rootReducer;