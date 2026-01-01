import { StyleSheet, Text, View, FlatList, RefreshControl, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllIncidents, Incident, deleteIncident } from '../../src/services/Database';
import { syncData } from '../../src/services/SyncService';

type FilterType = 'All' | 'High' | 'Medium' | 'Low' | 'Pending';

import * as SecureStore from 'expo-secure-store';

export default function HistoryScreen() {
    const router = useRouter();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');
    const [pendingCount, setPendingCount] = useState(0);
    const [userRole, setUserRole] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        const allData = await getAllIncidents();
        setIncidents(allData);
        setPendingCount(allData.filter(i => i.sync_status === 'pending').length);

        const role = await SecureStore.getItemAsync('userRole');
        if (role) setUserRole(role);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    const handleSyncAll = async () => {
        setRefreshing(true);
        await syncData(async () => {
            await loadData();
        });
        setRefreshing(false);
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Report",
            "Are you sure you want to delete this report? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteIncident(id);
                        await loadData();
                    }
                }
            ]
        );
    };

    const filteredIncidents = useMemo(() => {
        return incidents.filter(item => {
            // Search Filter
            const matchesSearch =

                (item.note || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.id.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;



            // Category Filter
            if (activeFilter === 'All') return true;
            if (activeFilter === 'Pending') return item.sync_status === 'pending';

            // Severity mapping: 1=Low, 2=Medium, 3=High
            if (activeFilter === 'Low') return item.severity === 1;
            if (activeFilter === 'Medium') return item.severity === 2;
            if (activeFilter === 'High') return item.severity === 3;

            return true;
        });
    }, [incidents, searchQuery, activeFilter, userRole]);

    const getSeverityBadge = (severity: number) => {
        if (severity === 3) return { label: 'HIGH', color: '#FEB2B2', text: '#C53030' }; // Red
        if (severity === 2) return { label: 'MEDIUM', color: '#FEEBC8', text: '#C05621' }; // Orange
        return { label: 'LOW', color: '#C6F6D5', text: '#2F855A' }; // Green
    };

    const renderItem = ({ item }: { item: Incident }) => {
        const severityStyle = getSeverityBadge(item.severity);
        const isPending = item.sync_status === 'pending';
        let imageUrl = null;
        try {
            const media = JSON.parse(item.media_uris || '[]');
            if (media.length > 0) imageUrl = media[0];
        } catch (e) { }
        

        return (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`incidents/${item.id}`)}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconBox}>
                        {imageUrl ? (
                            <Image
                                source={{ uri: imageUrl }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                            />
                        ) : (
                            <Ionicons name="alert-circle-outline" size={24} color="#4A5568" />
                        )}
                    </View>
                    <View style={styles.headerTextContainer}>
                        <View style={styles.titleRow}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{item.note || 'Untitled Incident'}</Text>
                            <View style={[styles.sevBadge, { backgroundColor: severityStyle.color }]}>
                                <Text style={[styles.sevText, { color: severityStyle.text }]}>{severityStyle.label}</Text>
                            </View>
                        </View>
                        <View style={styles.subRow}>
                            <Ionicons name="location-outline" size={12} color="#718096" />
                            <Text style={styles.locationText}>
                                {[item.plant, item.area, item.department].filter(Boolean).join(' • ') || 'Unknown Location'}
                            </Text>
                        </View>
                        <Text style={styles.idTextMeta} numberOfLines={1} ellipsizeMode="middle">ID: {item.id}</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={14} color="#718096" />
                        <Text style={styles.metaText}>{new Date(item.created_at).toLocaleString()}</Text>

                        <View style={styles.statusDotRow}>
                            <View style={[styles.dot, { backgroundColor: isPending ? '#ECC94B' : '#48BB78' }]} />
                            <Text style={styles.statusLabel}>{isPending ? 'Pending' : 'Synced'}</Text>
                        </View>
                    </View>



                    <View style={styles.actionRow}>
                        <View style={styles.leftActions}>
                            <TouchableOpacity
                                style={styles.editBtn}
                                onPress={() => router.push({ pathname: '/review', params: { incidentId: item.id } })}
                            >
                                <Ionicons name="create-outline" size={16} color="#2563EB" />
                                <Text style={styles.editText}>EDIT</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() => handleDelete(item.id)}
                            >
                                <Ionicons name="trash-outline" size={16} color="#E53E3E" />
                                <Text style={styles.deleteText}>DELETE</Text>
                            </TouchableOpacity>
                        </View>

                        {isPending && (
                            <TouchableOpacity style={styles.syncBtn} onPress={handleSyncAll}>
                                <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                                <Text style={styles.syncText}>SYNC</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.mainContainer}>
            {/* Header */}
            <View style={styles.header}>
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Incident Reports</Text>
                        <Text style={styles.headerSubtitle}>{pendingCount} reports pending sync</Text>
                    </View>
                </SafeAreaView>
            </View>

            {/* Filter Section */}
            <View style={styles.filterSection}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#A0AEC0" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search reports..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity>
                        <Ionicons name="filter-outline" size={20} color="#718096" />
                    </TouchableOpacity>
                </View>

                <View style={styles.chipsContainer}>
                    {(['All', 'High', 'Medium', 'Low', 'Pending'] as FilterType[]).map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.chip, activeFilter === filter && styles.chipActive]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[styles.chipText, activeFilter === filter && styles.chipTextActive]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* List */}
            <FlatList
                data={filteredIncidents}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No reports found.</Text>}
            />

            {/* Footer Sync All */}
            {pendingCount > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.footerBtn} onPress={handleSyncAll}>
                        <Text style={styles.footerBtnTitle}>SYNC ALL PENDING REPORTS</Text>
                        <Text style={styles.footerBtnSub}>{pendingCount} reports ready for sync</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    header: {
        backgroundColor: '#2563EB',
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        marginTop: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#BFDBFE',
        marginTop: 4,
    },
    filterSection: {
        backgroundColor: '#fff',
        padding: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
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
        fontSize: 16,
        color: '#2D3748',
    },
    chipsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#EDF2F7',
    },
    chipActive: {
        backgroundColor: '#2563EB',
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
    },
    chipTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#EDF2F7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    headerTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A202C',
        flex: 1,
        marginRight: 8,
    },
    sevBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    sevText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    subRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 13,
        color: '#718096',
    },
    idTextMeta: {
        fontSize: 11,
        color: '#A0AEC0',
        marginTop: 2,
    },
    cardBody: {
        paddingLeft: 60,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    metaText: {
        fontSize: 12,
        color: '#718096',
    },
    statusDotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginLeft: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#4A5568',
    },
    bulletContainer: {
        marginBottom: 16,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
        gap: 6,
    },
    bullet: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#2563EB',
    },
    bulletText: {
        fontSize: 14,
        color: '#2D3748',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    leftActions: {
        flexDirection: 'row',
        gap: 12,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#EBF8FF',
        borderRadius: 6,
        gap: 4,
    },
    editText: {
        color: '#2563EB',
        fontWeight: 'bold',
        fontSize: 12,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#FED7D7',
        borderRadius: 6,
        gap: 4,
    },
    deleteText: {
        color: '#C53030',
        fontWeight: 'bold',
        fontSize: 12,
    },
    syncBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#8B5CF6',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    syncText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    emptyText: {
        textAlign: 'center',
        color: '#A0AEC0',
        marginTop: 40,
        fontSize: 16,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#fff',
    },
    footerBtn: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        elevation: 4,
    },
    footerBtnTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footerBtnSub: {
        color: '#BFDBFE',
        fontSize: 12,
        marginTop: 2,
    },
});
