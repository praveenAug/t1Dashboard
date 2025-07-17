'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import dayjs from 'dayjs';
import { aggregateByTime } from '../utils/aggregate';
import { setInitialData, T1DataPoint } from '../store/t1Slice';
import { useHasHydrated } from '../hooks/useHasHydrated';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), {
    ssr: false
});

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
    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('hour');

    useEffect(() => {
        if (initialData?.length) {
            dispatch(setInitialData(initialData))
        }
    }, [])

    useEffect(() => {
        console.log('rawdata length now', rawData.length);
    }, [])

    const onDataZoom = (e: any) => {
        const startTime = e.batch?.[0]?.start ?? e.start;
        const endTime = e.batch?.[0]?.end ?? e.end;

        if (startTime != null || endTime != null) {
            const diffMs = endTime - startTime;
            const newZoomLevel: ZoomLevel = diffMs < 3 * 60 * 1000 ? 'second' :
                diffMs < 3 * 60 * 60 * 1000 ? 'minute' : 'hour';
            setZoomLevel(newZoomLevel);
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
            data-testid="echarts" 
            option={option}
            style={{ height: 400, width: '100%' }}
            onEvents={{ datazoom: onDataZoom }}
            notMerge={true}
            lazyUpdate={true}
        />
    );
};

export default T1Chart;