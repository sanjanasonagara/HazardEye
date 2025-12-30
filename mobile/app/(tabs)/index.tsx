import { StyleSheet, Text, View, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { initDatabase, getPendingIncidents } from '../../src/services/DatabaseMock';
import { syncIncidents } from '../../src/services/SyncService';

export default function HomeScreen() {
    const router = useRouter();
    const [pendingCount, setPendingCount] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        initDatabase();
        refreshPending();
    }, []);

    const refreshPending = () => {
        const pending = getPendingIncidents();
        setPendingCount(pending.length);
    };

    const handleSync = async () => {
        setRefreshing(true);
        await syncIncidents();
        refreshPending();
        setRefreshing(false);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refreshPending();
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    return (
        <View style={styles.mainContainer}>
            {/* Custom Header Area */}
            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerTitleRow}>
                            <Text style={styles.headerTitle}>Refinery Safety Capture</Text>
                            <Ionicons name="shield-checkmark" size={28} color="#fff" />
                        </View>
                        <View style={styles.offlineRow}>
                            <Ionicons name="wifi" size={16} color="#FBBF24" style={{ opacity: 0.8 }} />
                            <Text style={styles.offlineText}>OFFLINE MODE ACTIVE</Text>
                        </View>
                    </View>

                    {/* Device Info Card */}
                    <View style={styles.deviceCard}>
                        <View style={styles.deviceRow}>
                            <Text style={styles.deviceText}>Device ID: DEV-NJI1YGHT4</Text>
                            <Text style={styles.deviceText}></Text>
                        </View>
                        <View style={[styles.deviceRow, { marginTop: 10 }]}>
                            <Text style={styles.deviceStorageText}>Stored locally: {pendingCount} reports</Text>
                            {pendingCount > 0 && (
                                <TouchableOpacity onPress={handleSync} style={styles.syncButtonSmall}>
                                    <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                                    <Text style={styles.syncButtonTextSmall}>Sync</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Quick Actions Title */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                {/* Grid */}
                <View style={styles.gridContainer}>
                    {/* Capture Incident - Full Width */}
                    <TouchableOpacity style={styles.gridItemFull} onPress={() => router.push('/capture')}>
                        <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                            <Ionicons name="camera" size={32} color="#EF4444" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.gridTitle}>Capture Incident</Text>
                            <Text style={styles.gridSubtitle}>Photo/Video </Text>
                        </View>
                    </TouchableOpacity>

                    {/* View Reports */}
                    <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/(tabs)/history')}>
                        <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
                            <Ionicons name="list" size={32} color="#10B981" />
                        </View>
                        <Text style={styles.gridTitle}>View Reports</Text>
                        <Text style={styles.gridSubtitle}>{pendingCount} offline reports</Text>
                    </TouchableOpacity>

                    {/* My Tasks */}
                    <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/(tabs)/tasks')}>
                        <View style={[styles.iconCircle, { backgroundColor: '#FFEDD5' }]}>
                            <Ionicons name="clipboard" size={32} color="#F59E0B" />
                        </View>
                        <Text style={styles.gridTitle}>My Tasks</Text>
                        <Text style={styles.gridSubtitle}>3 pending tasks</Text>
                    </TouchableOpacity>
                </View>

                {/* ML Status Card */}
                <View style={styles.mlCard}>
                    <View style={styles.mlHeader}>
                        <Text style={styles.mlTitle}>Edge ML Status</Text>
                        <View style={styles.mlBadge}>
                            <Ionicons name="" size={14} color="#126807ff" />
                            <Text style={styles.mlBadgeText}>INACTIVE</Text>
                        </View>
                    </View>
                    <Text style={styles.mlSubtitle}>Model loaded and ready</Text>
                    <View style={styles.mlFooter}>
                        <Text style={styles.mlMeta}>Version:</Text>

                        <Text style={styles.mlMeta}>Updated:</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F3F4F6', // Light gray background
    },
    headerContainer: {
        backgroundColor: '#2563EB', // Blue header
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        marginBottom: 20,
    },
    headerTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    offlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        gap: 6,
    },
    offlineText: {
        color: '#FBBF24', // Amber/Yellow
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 0.5,
    },
    deviceCard: {
        backgroundColor: 'rgba(30, 58, 138, 0.6)', // Darker blue, semi-transparent
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    deviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deviceText: {
        color: '#BFDBFE', // Light blue text
        fontSize: 14,
    },
    deviceStorageText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    syncButtonSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    syncButtonTextSmall: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937', // Dark gray
        marginBottom: 16,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '47%', // Slightly less than half to fit gap/margin
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        marginBottom: 16, // Use marginBottom for row spacing
    },
    gridItemFull: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row', // Horizontal layout for full width
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        marginBottom: 16,
    },
    textContainer: {
        marginLeft: 16,
        alignItems: 'flex-start',
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    gridSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 16,
    },
    mlCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginTop: 4,
        elevation: 2, // Slight shadow
    },
    mlHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    mlTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    mlBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#cf3131ff', // Light green bg
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    mlBadgeText: {
        color: '#ffffffff', // Dark green text
        fontSize: 12,
        fontWeight: 'bold',
    },
    mlSubtitle: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 16,
    },
    mlFooter: {
        flexDirection: 'column', // Stack vertically
        gap: 4,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 12,
    },
    mlMeta: {
        fontSize: 12,
        color: '#6B7280',
    },
});
