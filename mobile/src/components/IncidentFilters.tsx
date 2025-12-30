import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Incident } from '../services/Database';

// Define types locally if not exported from a shared type file
// These match the web version
export type Severity = 'High' | 'Medium' | 'Low';
export type Department = 'Electrical' | 'Mechanical' | 'Civil' | 'Fire & Safety' | 'Environmental' | 'General';
export type IncidentStatus = 'open' | 'verified' | 'closed'; // lowercase in mobile db based on check

export interface FilterState {
    timeRange: 'All' | 'Today' | 'Weekly' | 'Monthly' | 'Custom';
    areas: string[];
    severities: Severity[];
    departments: Department[];
    statuses: IncidentStatus[];
    customStartDate?: Date;
    customEndDate?: Date;
}

interface IncidentFiltersProps {
    filters: FilterState;
    onUpdateFilters: (updates: Partial<FilterState>) => void;
    incidents: Incident[]; // used to extract available areas
}

const severities: Severity[] = ['High', 'Medium', 'Low'];
const departments: Department[] = [
    'Electrical',
    'Mechanical',
    'Civil',
    'Fire & Safety',
    'Environmental',
    'General',
];
const statuses: IncidentStatus[] = ['open', 'verified', 'closed'];
const timeRanges = ['All', 'Today', 'Weekly', 'Monthly'] as const;

export const IncidentFilters: React.FC<IncidentFiltersProps> = ({
    filters,
    onUpdateFilters,
    incidents,
}) => {
    const [expanded, setExpanded] = useState(false);

    const toggleFilter = <T extends string>(
        category: keyof FilterState,
        value: T
    ) => {
        // runtime check for array type (safe because we know the structure)
        const current = filters[category] as T[];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        onUpdateFilters({ [category]: updated } as any);
    };

    const clearAllFilters = () => {
        onUpdateFilters({
            timeRange: 'All',
            areas: [],
            severities: [],
            departments: [],
            statuses: [],
            customStartDate: undefined,
            customEndDate: undefined,
        });
    };

    const activeCount =
        (filters.timeRange !== 'All' ? 1 : 0) +
        filters.areas.length +
        filters.severities.length +
        filters.departments.length +
        filters.statuses.length;

    // Get unique areas
    const uniqueAreas = Array.from(new Set(incidents.map(i => i.area || 'Unknown'))).filter(Boolean);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
            >
                <View style={styles.headerLeft}>
                    <Ionicons name="filter" size={20} color="#4A5568" />
                    <Text style={styles.headerTitle}>Filters</Text>
                    {activeCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{activeCount}</Text>
                        </View>
                    )}
                </View>
                <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#A0AEC0" />
            </TouchableOpacity>

            {expanded && (
                <View style={styles.content}>
                    {/* Clear All */}
                    {activeCount > 0 && (
                        <TouchableOpacity style={styles.clearBtn} onPress={clearAllFilters}>
                            <Text style={styles.clearBtnText}>Clear All Filters</Text>
                        </TouchableOpacity>
                    )}

                    {/* Time Range */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Time Range</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.capsuleContainer}>
                            {timeRanges.map(range => (
                                <TouchableOpacity
                                    key={range}
                                    style={[styles.capsule, filters.timeRange === range && styles.capsuleActive]}
                                    onPress={() => onUpdateFilters({ timeRange: range })}
                                >
                                    <Text style={[styles.capsuleText, filters.timeRange === range && styles.capsuleTextActive]}>
                                        {range}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            {/* Custom logic omitted for simplicity in V1 */}
                        </ScrollView>
                    </View>

                    <View style={styles.divider} />

                    {/* Severity */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Severity</Text>
                        <View style={styles.gridContainer}>
                            {severities.map(severity => (
                                <TouchableOpacity
                                    key={severity}
                                    style={[styles.checkboxItem, filters.severities.includes(severity) && styles.checkboxItemActive]}
                                    onPress={() => toggleFilter('severities', severity)}
                                >
                                    <Text style={[styles.checkboxText, filters.severities.includes(severity) && styles.checkboxTextActive]}>{severity}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Status */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Status</Text>
                        <View style={styles.gridContainer}>
                            {statuses.map(status => (
                                <TouchableOpacity
                                    key={status}
                                    style={[styles.checkboxItem, filters.statuses.includes(status) && styles.checkboxItemActive]}
                                    onPress={() => toggleFilter('statuses', status)}
                                >
                                    <Text style={[styles.checkboxText, filters.statuses.includes(status) && styles.checkboxTextActive]}>{status.toUpperCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Departments */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Departments</Text>
                        <View style={styles.wrapContainer}>
                            {departments.map(dept => (
                                <TouchableOpacity
                                    key={dept}
                                    style={[styles.capsule, styles.smallCapsule, filters.departments.includes(dept) && styles.capsuleActive]}
                                    onPress={() => toggleFilter('departments', dept)}
                                >
                                    <Text style={[styles.capsuleText, filters.departments.includes(dept) && styles.capsuleTextActive]}>{dept}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Areas */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Areas / Plants</Text>
                        {uniqueAreas.length === 0 ? (
                            <Text style={styles.emptyText}>No areas found</Text>
                        ) : (
                            <View style={styles.wrapContainer}>
                                {uniqueAreas.map(area => (
                                    <TouchableOpacity
                                        key={area}
                                        style={[styles.capsule, styles.smallCapsule, filters.areas.includes(area) && styles.capsuleActive]}
                                        onPress={() => toggleFilter('areas', area)}
                                    >
                                        <Text style={[styles.capsuleText, filters.areas.includes(area) && styles.capsuleTextActive]}>{area}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#F8FAFC',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
        marginLeft: 8,
    },
    badge: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    clearBtn: {
        alignSelf: 'flex-end',
        marginBottom: 12,
    },
    clearBtnText: {
        color: '#E53E3E',
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 12,
    },
    capsuleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    wrapContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    capsule: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#EDF2F7',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    smallCapsule: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    capsuleActive: {
        backgroundColor: '#EBF8FF',
        borderColor: '#3182CE',
    },
    capsuleText: {
        color: '#4A5568',
        fontWeight: '500',
        fontSize: 14,
    },
    capsuleTextActive: {
        color: '#2B6CB0',
    },
    // Grid for boolean-like choices
    gridContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    checkboxItem: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CBD5E0',
        backgroundColor: '#fff',
    },
    checkboxItemActive: {
        backgroundColor: '#C6F6D5',
        borderColor: '#2F855A',
    },
    checkboxText: {
        color: '#4A5568',
        fontSize: 13,
        fontWeight: '500',
    },
    checkboxTextActive: {
        color: '#22543D',
    },
    emptyText: {
        color: '#A0AEC0',
        fontSize: 12,
        fontStyle: 'italic',
    },
});
