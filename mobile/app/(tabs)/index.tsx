import { StyleSheet, Text, View, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { initDatabase, getPendingIncidents, getTasks, Task, Device, updateDeviceSyncTime } from '../../src/services/Database';
import { syncData } from '../../src/services/SyncService';
import { useDeviceStore } from '../../src/store/useDeviceStore';

export default function HomeScreen() {
    const router = useRouter();
    const { device, refreshDeviceData } = useDeviceStore();
    const [pendingCount, setPendingCount] = useState(0);
    const [taskCount, setTaskCount] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const setup = async () => {
            await initDatabase();
            await refreshData();
        };
        setup();
    }, []);

    const refreshData = async () => {
        const pending = await getPendingIncidents();
        setPendingCount(pending.length);

        const allTasks = await getTasks();
        const pendingTasks = allTasks.filter(t => t.status !== 'Completed' && t.status !== 'completed');
        setTaskCount(pendingTasks.length);

        await refreshDeviceData();
    };

    const handleSync = async () => {
        setRefreshing(true);
        // Pass refreshData as callback so it runs after successful sync
        await syncData(async () => {
            if (device) {
                await updateDeviceSyncTime(device.id);
            }
            await refreshData();
        });
        setRefreshing(false);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshData();
        setRefreshing(false);
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
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="phone-portrait-outline" size={16} color="#BFDBFE" />
                                <Text style={styles.deviceText}>{device?.name || 'Loading Device...'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name="battery-charging" size={16} color={device && device.battery_level < 20 ? '#EF4444' : '#10B981'} />
                                <Text style={styles.deviceText}>{device?.battery_level || 0}%</Text>
                            </View>
                        </View>
                        <View style={[styles.deviceRow, { marginTop: 4 }]}>
                            <Text style={[styles.deviceText, { opacity: 0.7, fontSize: 12 }]}>{device?.station || 'Station Unknown'}</Text>
                            <Text style={[styles.deviceText, { opacity: 0.7, fontSize: 12 }]}>{device?.id || '...'}</Text>
                        </View>
                        <View style={[styles.deviceRow, { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }]}>
                            <Text style={styles.deviceStorageText}>Storage: {device?.storage_used || '...'}</Text>
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
                        <Text style={styles.gridSubtitle}>{taskCount} pending tasks</Text>
                    </TouchableOpacity>
                </View>



            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    headerContainer: {
        backgroundColor: '#2563EB',
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
        color: '#FBBF24',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 0.5,
    },
    deviceCard: {
        backgroundColor: 'rgba(30, 58, 138, 0.6)',
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
        color: '#BFDBFE',
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
        color: '#1F2937',
        marginBottom: 16,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '47%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        marginBottom: 16,
    },
    gridItemFull: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
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

});
