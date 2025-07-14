import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface T1DataPoint {
    timestamp: number;
    value: number;
}

interface T1State {
    rawData: T1DataPoint[];
    loading: boolean;
    error: string | null;
}

const initialState: T1State = {
    rawData: [],
    loading: false,
    error: null,
}

const t1Slice = createSlice({
    name: 't1',
    initialState,
    reducers: {
        setInitialData(state, action: PayloadAction<T1DataPoint[]>) {
            state.rawData = action.payload;
            state.loading = false;
            state.error = null;
        },
        addLiveData(state, action: PayloadAction<T1DataPoint>) {
            state.rawData.push(action.payload);

            //only 3 days of data in seconds
            const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
            state.rawData = state.rawData.filter((element) => element.timestamp >= threeDaysAgo);
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload
        },
    }
});

export const { setInitialData, addLiveData, setLoading, setError } = t1Slice.actions;
export default t1Slice.reducer;