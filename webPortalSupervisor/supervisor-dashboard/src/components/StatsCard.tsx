import React from 'react';
import type { LucideIcon } from "lucide-react";


interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    color?: string; // e.g., "blue", "red", "green", "orange"
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, color = "blue" }) => {

    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        red: "bg-red-50 text-red-600 border-red-100",
        green: "bg-green-50 text-green-600 border-green-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        slate: "bg-slate-50 text-slate-600 border-slate-100",
    };

    const currentColors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start justify-between transition-all hover:shadow-md">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                {trend && (
                    <p className={`text-xs mt-2 font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {trend} from last week
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-lg ${currentColors}`}>
                <Icon className="h-6 w-6" />
            </div>
        </div>
    );
};

export default StatsCard;
