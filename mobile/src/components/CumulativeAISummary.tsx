import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Incident } from '../types'; // Adjust import based on actual location
import { format, startOfMonth, startOfYear, subMonths, subYears } from 'date-fns';
import { Incident as DatabaseIncident } from '../services/Database';

// Bridging types if necessary. Assuming Database.Incident is what we use.
// If there's a specific 'Incident' type for the component, we might need to map it.
// For now, I'll use the DatabaseIncident type directly as 'Incident'.

interface CumulativeAISummaryProps {
    incidents: DatabaseIncident[];
    timeRange: 'All' | 'Today' | 'Weekly' | 'Monthly' | 'Custom';
    customStartDate?: Date;
    customEndDate?: Date;
}

export const CumulativeAISummary: React.FC<CumulativeAISummaryProps> = ({
    incidents,
    timeRange,
    customStartDate,
    customEndDate,
}) => {
    const summary = useMemo(() => {
        if (incidents.length === 0) {
            return {
                pattern: 'No incidents recorded in the selected time period.',
                trends: 'No trend data available.',
                commonCauses: 'Unable to identify common causes without incident data.',
            };
        }

        // Logic ported from web
        const severityCounts = incidents.reduce((acc, inc) => {
            // Assuming severity is a property on Incident. If strictly typed in generic way, might need casting or check.
            // The web code uses string keys.
            const sev = inc.severity || 'Low';
            acc[sev] = (acc[sev] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const departmentCounts = incidents.reduce((acc, inc) => {
            const dept = inc.department || 'Unknown';
            acc[dept] = (acc[dept] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const areaCounts = incidents.reduce((acc, inc) => {
            const area = inc.area || 'Unknown';
            acc[area] = (acc[area] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const highSeverityCount = severityCounts['High'] || 0;
        const highSeverityPercentage = (highSeverityCount / incidents.length) * 100;

        // Sort logic
        const topDepartment = Object.entries(departmentCounts)
            .sort(([, a], [, b]) => b - a)[0];

        const topArea = Object.entries(areaCounts)
            .sort(([, a], [, b]) => b - a)[0];

        const repeatAreas = Object.entries(areaCounts)
            .filter(([, count]) => count >= 2)
            .map(([area]) => area);

        // Generate pattern description
        const pattern = highSeverityPercentage > 40
            ? `Analysis reveals a concerning pattern: ${highSeverityPercentage.toFixed(0)}% of incidents are classified as High severity, indicating systemic safety risks requiring immediate attention.`
            : highSeverityPercentage > 20
                ? `Moderate risk pattern detected: ${highSeverityPercentage.toFixed(0)}% High severity incidents suggest areas for improvement in safety protocols.`
                : `Overall incident pattern shows ${highSeverityPercentage.toFixed(0)}% High severity incidents, indicating generally controlled risk levels.`;

        // Generate trend description
        // Need to parse dates safely. mobile uses string dates usually? 
        // The Database.ts type likely has string dates. Need to convert.
        const sortedIncidents = [...incidents].sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        const firstHalf = sortedIncidents.slice(0, Math.floor(incidents.length / 2));
        const secondHalf = sortedIncidents.slice(Math.floor(incidents.length / 2));

        const firstHalfHigh = firstHalf.filter(i => i.severity === 'High').length;
        const secondHalfHigh = secondHalf.filter(i => i.severity === 'High').length;

        const trendDirection = secondHalfHigh > firstHalfHigh
            ? 'increasing'
            : secondHalfHigh < firstHalfHigh
                ? 'decreasing'
                : 'stable';

        const trends = trendDirection === 'increasing'
            ? `Trend analysis shows an ${trendDirection} frequency of high-severity incidents over the selected period. Immediate intervention recommended in ${topDepartment?.[0] || 'affected areas'}.`
            : trendDirection === 'decreasing'
                ? `Trend analysis indicates a ${trendDirection} pattern in high-severity incidents, suggesting effective safety measures. Continued monitoring recommended.`
                : `Trend analysis shows ${trendDirection} incident frequency. Focus preventive measures on ${topDepartment?.[0] || 'identified areas'}.`;

        // Generate common causes
        const commonCauses = repeatAreas.length > 0
            ? `Common causes identified: ${topDepartment?.[0] || 'Multiple'} department accounts for ${topDepartment?.[1] || 0} incidents (${((topDepartment?.[1] || 0) / incidents.length * 100).toFixed(0)}%). Repeat incidents detected in ${repeatAreas.slice(0, 3).join(', ')}${repeatAreas.length > 3 ? ` and ${repeatAreas.length - 3} other area${repeatAreas.length - 3 > 1 ? 's' : ''}` : ''}, indicating potential systemic issues requiring targeted safety interventions.`
            : `Primary incident sources: ${topDepartment?.[0] || 'Various'} department shows highest frequency (${topDepartment?.[1] || 0} incidents). Most incidents concentrated in ${topArea?.[0] || 'multiple areas'}. Recommend focused safety audits and preventive maintenance in identified zones.`;

        return { pattern, trends, commonCauses };
    }, [incidents, timeRange, customStartDate, customEndDate]);

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons name="analytics" size={24} color="#fff" />
                </View>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.cardTitle}>Cumulative AI Insights</Text>
                    <Text style={styles.cardSubtitle}>
                        Analysis based on {incidents.length} incident{incidents.length !== 1 ? 's' : ''} in selected period
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                {/* Incident Patterns */}
                <View style={[styles.insightBox, { borderColor: '#BFDBFE' }]}>
                    <View style={styles.insightHeader}>
                        <Ionicons name="scan-outline" size={20} color="#2563EB" style={styles.insightIcon} />
                        <Text style={styles.insightTitle}>Incident Patterns</Text>
                    </View>
                    <Text style={styles.insightText}>{summary.pattern}</Text>
                </View>

                {/* Risk Trends */}
                <View style={[styles.insightBox, { borderColor: '#E2E8F0' }]}>
                    <View style={styles.insightHeader}>
                        {/* Using trending-up if available or similar */}
                        <Ionicons name="trending-up" size={20} color="#3182CE" style={styles.insightIcon} />
                        <Text style={styles.insightTitle}>Risk Trends</Text>
                    </View>
                    <Text style={styles.insightText}>{summary.trends}</Text>
                </View>

                {/* Common Causes */}
                <View style={[styles.insightBox, { borderColor: '#FBD38D' }]}>
                    <View style={styles.insightHeader}>
                        <Ionicons name="alert-circle-outline" size={20} color="#D69E2E" style={styles.insightIcon} />
                        <Text style={styles.insightTitle}>Common Causes & Recommendations</Text>
                    </View>
                    <Text style={styles.insightText}>{summary.commonCauses}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff', // Or gradient if possible, but solid is safer
        borderLeftWidth: 4,
        borderLeftColor: '#2563EB',
        borderRadius: 12,
        marginVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#EFF6FF', // Light blue tint
    },
    iconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#2563EB',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A202C',
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#718096',
        marginTop: 2,
    },
    cardBody: {
        padding: 16,
        gap: 12,
    },
    insightBox: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    insightIcon: {
        marginRight: 8,
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D3748',
    },
    insightText: {
        fontSize: 13,
        color: '#4A5568',
        lineHeight: 18,
    },
});
