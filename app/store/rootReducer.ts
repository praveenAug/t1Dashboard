import { combineReducers } from "redux";
import t1Reducer from './t1Slice';

export default combineReducers({
    t1: t1Reducer,
})