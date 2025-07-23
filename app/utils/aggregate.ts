import { T1DataPoint } from "../store/t1Slice";

export function aggregateByTime(
  data: T1DataPoint[],
  resolutionInMs: number
): [string, number, number][] {
  const buckets = new Map<number, { tempSum: number; humidSum: number; count: number }>();

  for (const { timestamp, temperature, humidity } of data) {
    const ms = new Date(timestamp).getTime();
    if (isNaN(ms)) {
      console.warn("Invalid timestamp", timestamp);
      continue;
    }

    const bucketStart = Math.floor(ms / resolutionInMs) * resolutionInMs;

    if (!buckets.has(bucketStart)) {
      buckets.set(bucketStart, { tempSum: 0, humidSum: 0, count: 0 });
    }

    const bucket = buckets.get(bucketStart)!;
    bucket.tempSum += temperature ?? 0;
    bucket.humidSum += humidity ?? 0;
    bucket.count += 1;
  }

  const aggregated: [string, number, number][] = Array.from(buckets.entries()).map(
    ([bucketStart, { tempSum, humidSum, count }]) => {
      const avgTemp = tempSum / count;
      const avgHumid = humidSum / count;
      return [
        new Date(bucketStart).toISOString(),
        parseFloat(avgTemp.toFixed(2)),
        parseFloat(avgHumid.toFixed(2)),
      ] as [string, number, number];
    }
  );

  return aggregated.sort((a, b) => a[0].localeCompare(b[0]));
}
