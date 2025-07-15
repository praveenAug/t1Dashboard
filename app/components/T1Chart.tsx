'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { aggregateByTime } from '../utils/aggregate';
import { setInitialData, T1DataPoint } from '../store/t1Slice';
import { useHasHydrated } from '../hooks/useHasHydrated';

type ZoomLevel = 'hour' | 'minute' | 'second';

interface T1ChartProps {
    initialData: T1DataPoint[];
}

function getResolutionForZoom(level: ZoomLevel) {
    switch (level) {
        case 'hour': return 60 * 60 * 1000;
        case 'minute': return 60 * 1000;
        case 'second': return 1000;
    }
}
const T1Chart: React.FC<T1ChartProps> = ({ initialData }) => {
    const hasHydrated = useHasHydrated();
    const dispatch = useDispatch();
    const rawData = useSelector((state: RootState) => state.t1.rawData);
    const loading = useSelector((state: RootState) => state.t1.loading);
    const error = useSelector((state: RootState) => state.t1.error);
    console.log('rawDatamll', rawData);
    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('hour');
    const [dataZoomRange, setDataZoomRange] = useState({ start: 90, end: 100 });

    useEffect(() => {
        if (initialData?.length) {
            dispatch(setInitialData(initialData))
        }
    }, [])

    useEffect(() => {
        console.log('rawdata length now', rawData.length);
    }, [])

    const hydratedData = useMemo(() => {
        if (!hasHydrated) return [];
        return rawData.map(pt => [dayjs(pt.timestamp).toISOString(), pt.value])
    }, [hasHydrated, rawData]);

    const onDataZoom = (e: any) => {
        const startTime = e.batch?.[0]?.start ?? e.start;
        const endTime = e.batch?.[0]?.end ?? e.end;

        if (startTime != null || endTime != null) {
            // const diffPercent = endTime - startTime;

            const diffMs = endTime - startTime;

            const newZoomLevel: ZoomLevel = diffMs < 3 * 60 * 1000 ? 'second' :
                diffMs < 3 * 60 * 60 * 1000 ? 'minute' : 'hour';

            setZoomLevel(newZoomLevel);
            // setDataZoomRange({ start: startTime, end: endTime });
        }
    }

    //aggrate data bsed on zoom level
    const aggregateData = useMemo(() => {
        const resolution = getResolutionForZoom(zoomLevel);
        return aggregateByTime(rawData, resolution).map(([timestamp, value]) => [
            dayjs(timestamp).toISOString(), //x-axis time
            value,//y-axis
        ]);
    }, [rawData, zoomLevel])

    // const chartData = useMemo(() => {
    //     return rawData.map((point) => [
    //         dayjs(point.timestamp).toISOString(), //x-axis time
    //         point.value, //y-axis
    //     ]);
    // }, [rawData, zoomLevel]);
    // const now = Date.now();
    // const testData = [
    //     { timestamp: now, value: 1.1 },
    //     { timestamp: now + 1000, value: 1.2 },
    //     { timestamp: now + 2000, value: 1.3 },
    // ]
    // console.log(aggregateByTime(testData, 1000))
    const option = useMemo(() => ({
        title: {
            text: 'T1 Temperature',
        },
        tooltip: {
            trigger: 'axis',
            formatter: (params: any) => {
                const p = params[0];
                return `${dayjs(p.data[0]).format('HH:mm:ss')}<br/>T1: ${p.data[1].toFixed(2)}C`;
            },
        },
        xAxis: {
            type: 'time',
            name: 'Time',
        },
        yAxis: {
            type: 'value',
            name: 'T1 (C)',
            min: -5,
            max: 5,
        },
        dataZoom: [
            {
                type: 'slider',
                throttle: 200,
                start: 90,
                end: 100,
            },
            {
                type: 'inside',
                throttle: 200,
            },
        ],
        series: [
            {
                name: 'T1 Temperature',
                type: 'line',
                showSymbol: false,
                smooth: true,
                data: aggregateData,
            }
        ]
    }), [aggregateData]);
    if (!hasHydrated) return null;
    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>
    if (!rawData.length) return <div>No data Available</div>
    return (
        <ReactECharts
            option={option}
            style={{ height: 400, width: '100%' }}
            onEvents={{ datazoom: onDataZoom }}
            notMerge={true}
            lazyUpdate={true}
        />
    );
};

export default T1Chart;