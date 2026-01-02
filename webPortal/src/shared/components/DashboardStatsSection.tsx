import React from 'react';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

export interface DashboardStat {
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down';
    icon: LucideIcon;
    color: string;
    bg: string;
}

interface DashboardStatsSectionProps {
    stats: DashboardStat[];
}

export const DashboardStatsSection: React.FC<DashboardStatsSectionProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
                let background = 'white';
                let textColor = 'var(--color-text-main)';
                let subTextColor = '#64748b';
                let iconColor = '#475569';

                // Keep the exact Admin gradients/styles
                if (index % 4 === 0) { // Blue
                    background = 'linear-gradient(135deg, #3b86ffff 0%, #88bcf8ff 50%, #63a0f0ff 100%)';
                    textColor = 'white';
                    subTextColor = 'rgba(255, 255, 255, 0.9)';
                    iconColor = 'white';
                } else if (index % 4 === 1) { // Amber
                    background = 'linear-gradient(135deg, #fcd34d 0%, #feedabff 50%, #fae284ff 100%)';
                    textColor = '#92400e'; // text-amber-800
                    subTextColor = '#b45309'; // text-amber-700
                    iconColor = '#fff'; // White for icon
                } else if (index % 4 === 2) { // Red
                    background = 'linear-gradient(135deg, #f87171 0%, #f99898ff 50%, #faadadff 100%)';
                    textColor = '#fff'; // White text
                    subTextColor = 'rgba(255, 255, 255, 0.9)'; 
                    iconColor = '#fff'; // White icon
                } else if (index % 4 === 3) { // Teal
                    background = 'linear-gradient(135deg, #14b8a6 0%, #3dcdaeff 50%, #f0fdfa 100%)';
                    textColor = '#fff'; // White text
                    subTextColor = 'rgba(255, 255, 255, 0.9)';
                    iconColor = '#fff'; // White icon
                }

                return (
                    <div key={index} className="card" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        background: background,
                        color: textColor,
                        border: 'none',
                        borderRadius: '0.75rem',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        <div className="flex justify-between items-start" style={{ position: 'relative', zIndex: 10, padding: '0.75rem 0.75rem 0 0.75rem' }}>
                            <div>
                                <p className="text-sm font-medium" style={{ color: subTextColor }}>{stat.title}</p>
                                <div className="text-3xl font-bold" style={{ marginTop: '0.25rem' }}>{stat.value}</div>
                            </div>
                            <div style={{
                                padding: '0.75rem',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(4px)',
                            }}>
                                <stat.icon size={28} color={iconColor} />
                            </div>
                        </div>

                        <div style={{ padding: '0 0.75rem 0.75rem 0.75rem', display: 'flex', alignItems: 'center', fontSize: '1rem', position: 'relative', zIndex: 10 }}>
                            {stat.trend === 'up' ? (
                                <ArrowUpRight size={16} color={iconColor} style={{ marginRight: '0.25rem' }} />
                            ) : (
                                <ArrowDownRight size={16} color={iconColor} style={{ marginRight: '0.25rem' }} />
                            )}
                            <span style={{ fontWeight: 600, color: iconColor }}>
                                {stat.change}
                            </span>
                            <span style={{ marginLeft: '0.5rem', color: subTextColor, fontSize: '0.75rem', fontWeight: 500 }}>vs last month</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
