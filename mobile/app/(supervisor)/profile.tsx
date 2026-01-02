import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { syncData } from '../../src/services/SyncService';
import { useDeviceStore } from '../../src/store/useDeviceStore';

export default function SupervisorProfileScreen() {
    const router = useRouter();
    const { refreshDeviceData } = useDeviceStore();
    const [isSyncing, setIsSyncing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            refreshDeviceData();
        }, [])
    );

    const handleLogout = async () => {
        try {
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('user');
            await SecureStore.deleteItemAsync('userRole');
            router.replace('/login');
        } catch (error) {
            Alert.alert("Error", "Failed to logout properly");
        }
    };

    const handleSyncAll = async () => {
        setIsSyncing(true);
        try {
            await syncData(() => {
                refreshDeviceData();
                setIsSyncing(false);
                Alert.alert(
                    "Sync Complete",
                    "All data has been synchronized with the server.",
                    [{ text: "OK" }]
                );
            });
        } catch (error) {
            setIsSyncing(false);
            Alert.alert(
                "Sync Failed",
                "Could not sync data. Please check your connection and try again.",
                [{ text: "OK" }]
            );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <View style={styles.headerContent}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="shield" size={40} color="#fff" />
                        </View>
                        <Text style={styles.userName}>Supervisor Account</Text>
                        <Text style={styles.userRole}>Safety Supervisor</Text>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <TouchableOpacity style={styles.listItem} onPress={handleLogout}>
                        <View style={styles.iconBox}>
                            <Ionicons name="log-out-outline" size={20} color="#C53030" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.itemText, { color: '#C53030' }]}>Log Out / Switch Account</Text>
                            <Text style={styles.subText}>Sign out to switch to Field Worker view</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Access</Text>
                    <TouchableOpacity 
                        style={styles.fieldViewButton} 
                        onPress={() => router.push('/(tabs)')}
                    >
                        <View style={styles.iconBox}>
                            <Ionicons name="people-outline" size={20} color="#2563EB" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemText}>Field Worker Dashboard</Text>
                            <Text style={styles.subText}>Switch to field worker view</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={20} color="#2563EB" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General</Text>
                    <View style={styles.listItem}>
                        <View style={styles.iconBox}>
                            <Ionicons name="settings-outline" size={20} color="#2563EB" />
                        </View>
                        <Text style={styles.itemText}>Settings</Text>
                        <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
                    </View>
                    <View style={styles.listItem}>
                        <View style={styles.iconBox}>
                            <Ionicons name="notifications-outline" size={20} color="#2563EB" />
                        </View>
                        <Text style={styles.itemText}>Notifications</Text>
                        <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
                    </View>
                </View>

                {/* Sync All Button */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data Sync</Text>
                    <TouchableOpacity 
                        style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]} 
                        onPress={handleSyncAll}
                        disabled={isSyncing}
                    >
                        <View style={styles.syncButtonContent}>
                            {isSyncing ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                            )}
                            <View style={styles.syncTextContainer}>
                                <Text style={styles.syncButtonTitle}>
                                    {isSyncing ? 'Syncing...' : 'Sync All Data'}
                                </Text>
                                <Text style={styles.syncButtonSubtitle}>
                                    {isSyncing ? 'Uploading and downloading' : 'Upload reports & download latest data'}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        backgroundColor: '#1E40AF', // Darker blue for supervisor
        paddingBottom: 40,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        alignItems: 'center',
        paddingTop: 20,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 4,
        borderColor: '#60A5FA',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        color: '#93C5FD',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: 16,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        elevation: 1,
    },
    iconBox: {
        width: 40,
        height: 40,
        backgroundColor: '#F7FAFC',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    itemText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
        flex: 1,
    },
    subText: {
        fontSize: 12,
        color: '#718096',
        marginTop: 2,
    },
    syncButton: {
        backgroundColor: '#2563EB',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    syncButtonDisabled: {
        backgroundColor: '#93C5FD',
        shadowOpacity: 0.1,
    },
    syncButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    syncTextContainer: {
        flex: 1,
    },
    syncButtonTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    syncButtonSubtitle: {
        fontSize: 13,
        color: '#DBEAFE',
    },
    fieldViewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EBF8FF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        elevation: 1,
        borderWidth: 2,
        borderColor: '#BFDBFE',
    },
});
