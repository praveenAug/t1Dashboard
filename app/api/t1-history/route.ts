import { NextResponse } from "next/server";

type T1DataPoint = {
    timestamp: number;
    value: number;
};

export async function GET() {
    const now = Date.now();
    const intervalMs = 60 * 60 * 1000; //hourly for 3 days
    const totalPoints = 72;

    const data: T1DataPoint[] = Array.from({
        length: totalPoints
    }, (_, i) => ({
        timestamp: now - (totalPoints - i) * intervalMs,
        value: parseFloat((Math.random() * 10 - 5).toFixed(2))
    }));
console.log('datallkk', data)
    return NextResponse.json(data);
}