import { T1DataPoint } from "../store/t1Slice";

export async function fetchT1History(): Promise<T1DataPoint[]> {
    const res = await fetch('http://localhost:3000/api/t1-history');
    if (!res.ok) {
        throw new Error('failed to fetch T1 history');
    }

    return res.json();
}