import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
    Cell
} from 'recharts';

export type ChartDataPoint = {
    name: string;
    count: number;
};

interface IncidentChartProps {
    data: ChartDataPoint[];
    variant?: 'admin' | 'supervisor';
    height?: string | number;
}

const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#0ea5e9', '#22c55e', '#6366f1'];

export const IncidentChart: React.FC<IncidentChartProps> = ({
    data,
    variant = 'admin',
    height = '100%'
}) => {
    // Admin Visual Specs
    const adminProps = {
        margin: { top: 20, right: 30, left: 20, bottom: 5 },
        barSize: 50,
        radius: [4, 4, 0, 0] as [number, number, number, number],
        xAxis: { height: 60, dy: 10, fontSize: 12, stroke: undefined },
        label: { fontSize: '12px' },
        fill: "#3b82f6"
    };

    // Supervisor Visual Specs
    const supervisorProps = {
        margin: { top: 20, right: 24, left: 8, bottom: 56 }, // larger bottom for rotate
        barSize: 42,
        radius: [6, 6, 0, 0] as [number, number, number, number],
        xAxis: { height: 72, dy: 0, fontSize: 11, stroke: "#94a3b8" },
        label: { fontSize: 11 },
        fill: undefined // handled by Cell
    };

    const config = variant === 'admin' ? adminProps : supervisorProps;

    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={config.margin}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="name"
                        axisLine={variant === 'supervisor'}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: config.xAxis.fontSize, fontWeight: 600 }}
                        dy={config.xAxis.dy}
                        angle={-45}
                        textAnchor="end"
                        height={config.xAxis.height}
                        stroke={config.xAxis.stroke}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                        stroke="#94a3b8"
                        allowDecimals={false}
                    />
                    <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={variant === 'supervisor' ? {
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.12)',
                        } : undefined}
                    />
                    <Bar
                        dataKey="count"
                        fill={config.fill}
                        radius={config.radius}
                        barSize={config.barSize}
                    >
                        <LabelList
                            dataKey="count"
                            position="top"
                            offset={variant === 'admin' ? 0 : 8}
                            style={{
                                fill: variant === 'admin' ? '#3b82f6' : '#1d4ed8',
                                fontSize: config.label.fontSize,
                                fontWeight: variant === 'admin' ? 'bold' : 700
                            }}
                        />
                        {variant === 'supervisor' && data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
