import { StyleSheet, Text, View, FlatList, RefreshControl, TouchableOpacity, Alert, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllIncidents, Incident, updateIncidentStatus } from '../../src/services/Database';

import { IncidentFilters, FilterState, Severity, Department, IncidentStatus } from '../../src/components/IncidentFilters';
import { isWithinInterval, parseISO, startOfDay, endOfDay, subDays, startOfMonth, startOfYear, subMonths, subYears } from 'date-fns';

export default function SupervisorIncidentsScreen() {
    const router = useRouter();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({
        timeRange: 'All',
        areas: [],
        severities: [],
        departments: [],
        statuses: [],
    });

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        const allData = await getAllIncidents();
        setIncidents(allData);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    const getSeverityLabel = (val: number): Severity => {
        if (val >= 0.7) return 'High';
        if (val >= 0.4) return 'Medium';
        return 'Low';
    };

    // Filter Logic
    const filteredIncidents = useMemo(() => {
        return incidents.filter(incident => {
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const severityLabel = getSeverityLabel(incident.severity);
                const haystacks = [
                    incident.note,
                   
                    incident.area,
                    incident.plant,
                    incident.department,
                    severityLabel,
                    incident.id
                ];
                const matchesSearch = haystacks.some(
                    val => val && val.toLowerCase().includes(q)
                );
                if (!matchesSearch) return false;
            }

            if (filters.severities.length > 0) {
                const label = getSeverityLabel(incident.severity);
                if (!filters.severities.includes(label)) return false;
            }

            if (filters.departments.length > 0) {
                if (!incident.department || !filters.departments.includes(incident.department as Department)) return false;
            }

            if (filters.statuses.length > 0) {
                if (!incident.status || !filters.statuses.includes(incident.status as IncidentStatus)) return false;
            }

            if (filters.areas.length > 0) {
                if (!incident.area || !filters.areas.includes(incident.area)) return false;
            }

            if (filters.timeRange !== 'All') {
                const date = parseISO(incident.created_at);
                const now = new Date();

                switch (filters.timeRange) {
                    case 'Today':
                        if (!isWithinInterval(date, { start: startOfDay(now), end: endOfDay(now) })) return false;
                        break;
                    case 'Weekly':
                        if (date < subDays(now, 7)) return false;
                        break;
                    case 'Monthly':
                        if (date < startOfMonth(subMonths(now, 1))) return false;
                        break;
                    case 'Custom':
                        if (filters.customStartDate && date < filters.customStartDate) return false;
                        if (filters.customEndDate && date > filters.customEndDate) return false;
                        break;
                }
            }

            return true;
        });
    }, [incidents, searchQuery, filters]);

    const handleVerify = (id: string) => {
        Alert.alert("Verify", "Mark this incident as Verified?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Verify",
                onPress: async () => {
                    await updateIncidentStatus(id, 'verified');
                    await loadData();
                }
            }
        ]);
    };

    const handleClose = (id: string) => {
        Alert.alert("Close", "Close this incident? It will be marked as resolved.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Close Event",
                style: 'destructive',
                onPress: async () => {
                    await updateIncidentStatus(id, 'closed');
                    await loadData();
                }
            }
        ]);
    };

    const handleMarkComplete = (id: string) => {
        Alert.alert("Mark Complete", "This will verify and close this incident as resolved. Continue?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Mark Complete",
                style: 'default',
                onPress: async () => {
                    try {
                        // Get the incident to find its server_id
                        const incident = incidents.find(i => i.id === id);
                        if (!incident) return;

                        // Update backend if we have a server_id
                        if (incident.server_id) {
                            const { default: api } = await import('../../src/services/api');
                            await api.patch(`/incidents/${incident.server_id}/status`, {
                                status: 'Closed'
                            });
                        }

                        // Update local database
                        await updateIncidentStatus(id, 'closed');
                        await loadData();
                    } catch (error) {
                        console.error('Failed to mark incident complete:', error);
                        Alert.alert('Error', 'Failed to update incident status. Please try again.');
                    }
                }
            }
        ]);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'verified': return { bg: '#C6F6D5', text: '#2F855A' };
            case 'closed': return { bg: '#E2E8F0', text: '#4A5568' };
            default: return { bg: '#FEFCBF', text: '#D69E2E' };
        }
    };

    const renderHeader = () => (
        <View style={styles.listHeader}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#A0AEC0" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search incidents..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#A0AEC0"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color="#A0AEC0" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filters */}
            <IncidentFilters
                filters={filters}
                onUpdateFilters={(updates) => setFilters(prev => ({ ...prev, ...updates }))}
                incidents={incidents}
            />



            {filteredIncidents.length > 0 && (
                <Text style={styles.resultsText}>
                    Showing {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''}
                </Text>
            )}
        </View>
    );

    const renderItem = ({ item }: { item: Incident }) => {
        const status = item.status || 'open';
        const statusColors = getStatusColor(status);
        const severityLabel = getSeverityLabel(item.severity);

        let imageUrl = null;
        try {
            const media = JSON.parse(item.media_uris || '[]');
            if (Array.isArray(media) && media.length > 0) {
                imageUrl = media[0];
            }
        } catch (e) {
        }

        return (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/(supervisor)/incidents/${item.id}`)}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    {/* Image Section */}
                    <View style={styles.imageContainer}>
                        {imageUrl ? (
                            <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
                        ) : (
                            <View style={[styles.thumbnail, { backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="image-outline" size={20} color="#CBD5E0" />
                            </View>
                        )}
                    </View>

                    {/* Content Section */}
                    <View style={{ flex: 1 }}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.cardTitle} numberOfLines={2}>
                                    {item.department ? `${item.department}: ` : ''}{ item.note || 'Untitled Incident'}
                                </Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                                <Text style={[styles.statusText, { color: statusColors.text }]}>{status.toUpperCase()}</Text>
                            </View>
                        </View>

                        <View style={styles.metaRow}>
                            <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                            <Text style={styles.metaDivider}>•</Text>
                            <Text style={styles.areaText} numberOfLines={1}>{item.area || 'Unknown Area'} ({item.plant || 'Plant'})</Text>
                        </View>

                        <View style={styles.metaRow}>
                            <View style={[styles.severityBadge, severityLabel === 'High' ? styles.sevHigh : severityLabel === 'Medium' ? styles.sevMed : styles.sevLow]}>
                                <Text style={[styles.severityText, severityLabel === 'High' ? { color: '#C53030' } : severityLabel === 'Medium' ? { color: '#C05621' } : { color: '#2F855A' }]}>{severityLabel}</Text>
                            </View>
                            <Text style={[styles.idText, { marginLeft: 'auto' }]}>ID: {item.id.substring(0, 8)}...</Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                    {status === 'open' && (
                        <>
                            <TouchableOpacity style={styles.verifyBtn} onPress={() => handleVerify(item.id)}>
                                <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                                <Text style={styles.btnText}>VERIFY</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.completeBtn} onPress={() => handleMarkComplete(item.id)}>
                                <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
                                <Text style={styles.btnText}>MARK COMPLETE</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {status === 'verified' && (
                        <TouchableOpacity style={styles.completeBtn} onPress={() => handleMarkComplete(item.id)}>
                            <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
                            <Text style={styles.btnText}>MARK COMPLETE</Text>
                        </TouchableOpacity>
                    )}

                    {status !== 'closed' && status !== 'open' && status !== 'verified' && (
                        <TouchableOpacity style={styles.closeBtn} onPress={() => handleClose(item.id)}>
                            <Ionicons name="close-circle-outline" size={16} color="#fff" />
                            <Text style={styles.btnText}>CLOSE</Text>
                        </TouchableOpacity>
                    )}

                    {status === 'closed' && (
                        <View style={styles.closedInfo}>
                            <Ionicons name="lock-closed" size={14} color="#718096" />
                            <Text style={styles.closedText}>Resolved</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <Text style={styles.headerTitle}>Incident Management</Text>
                    <Text style={styles.headerSubtitle}>Verify and close reported incidents</Text>
                </SafeAreaView>
            </View>

            <FlatList
                data={filteredIncidents}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="filter-circle-outline" size={48} color="#CBD5E0" />
                        <Text style={styles.emptyText}>No incidents found</Text>
                        <Text style={styles.emptySubText}>
                            Try adjusting your search or filters to see more results
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    header: {
        backgroundColor: '#2563EB',
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 10,
    },
    headerSubtitle: {
        color: '#BFDBFE',
        fontSize: 14,
        marginTop: 4,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    listHeader: {
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        color: '#2D3748',
        fontSize: 14,
    },
    resultsText: {
        textAlign: 'center',
        color: '#718096',
        fontSize: 12,
        marginTop: 8,
        marginBottom: 8,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2D3748',
        lineHeight: 20,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    metaDivider: {
        marginHorizontal: 6,
        color: '#CBD5E0',
    },
    areaText: {
        fontSize: 12,
        color: '#4A5568',
        flex: 1,
    },
    imageContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        overflow: 'hidden',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
        paddingTop: 12,
        marginTop: 12,
        justifyContent: 'flex-end',
    },
    verifyBtn: {
        backgroundColor: '#48BB78',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        gap: 4,
    },
    closeBtn: {
        backgroundColor: '#E53E3E',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        gap: 4,
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 10,
    },
    closedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    closedText: {
        color: '#718096',
        fontSize: 12,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        textAlign: 'center',
        color: '#4A5568',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    },
    emptySubText: {
        textAlign: 'center',
        color: '#A0AEC0',
        marginTop: 8,
        fontSize: 13,
        paddingHorizontal: 32,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 12,
        color: '#718096',
        fontWeight: '500',
    },
    idText: {
        fontSize: 10,
        color: '#A0AEC0',
    },
    severityBadge: {
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
        borderWidth: 1,
    },
    severityText: {
        fontSize: 10,
        fontWeight: '600',
    },
    sevHigh: {
        borderColor: '#FEB2B2',
        backgroundColor: '#FFF5F5',
    },
    sevMed: {
        borderColor: '#FBD38D',
        backgroundColor: '#FFFAF0',
    },
    sevLow: {
        borderColor: '#90CDF4',
        backgroundColor: '#EBF8FF',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    workerDashboardBtn: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    workerDashboardText: {
        color: '#2563EB',
        fontWeight: '600',
        fontSize: 13,
    },
    completeBtn: {
        backgroundColor: '#38A169',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        gap: 4,
    },
});
