import { T1DataPoint } from "../store/t1Slice";

export function aggregateByTime(data: T1DataPoint[], resolutionInMs: number): [string, number, number][] {
    const buckets = new Map<number, number[], number[]>();

    //creating bucketList
    for (const { timestamp, value, humidityVal } of data) {
        const ms = new Date(timestamp).getTime();
        if (isNaN(ms)) {
            console.warn('invalid timestamp', timestamp);
            continue;
        }

        const bucketStart = Math.floor(ms / resolutionInMs) * resolutionInMs;

        if (!buckets.has(bucketStart)) {
            buckets.set(bucketStart, []);
        }

        buckets.get(bucketStart)!.push(value, humidityVal);
    }
console.log('buckets', buckets)
    const aggregated = Array.from(buckets.entries()).map(([bucketStart, values]) => {
        const avg = values.reduce((sum: any, v: any) => sum + v, 0) / values.length;
        return [new Date(bucketStart).toISOString(), parseFloat(avg.toFixed(2))] as [string, number];
    });
    console.log('aggg', aggregated)
    return aggregated.sort((a, b) => a[0].localeCompare(b[0]));
}