import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function ProfileScreen() {
    const router = useRouter();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [autoUploadEnabled, setAutoUploadEnabled] = useState(false);

    const handleLogout = async () => {
        // We can clear session or just navigate to login to allow switching
        // For security, let's clear but user can log back in
        try {
            // Optional: await SecureStore.deleteItemAsync('token');
            router.replace('/login');
        } catch (error) {
            router.replace('/login');
        }
    };

    const showSafetyGuidelines = () => {
        Alert.alert(
            "Safety Guidelines",
            "1. Always wear PPE.\n2. Report all incidents immediately.\n3. Follow lockout/tagout procedures.\n4. Stay hydration in high heat areas.",
            [{ text: "OK" }]
        );
    };

    const contactSupport = () => {
        Alert.alert(
            "Help & Support",
            "Contact Safety Officer:\n\nPhone: +1 (555) 012-3456\nEmail: safety@refinery.com\n\nHours: 24/7",
            [{ text: "Call", onPress: () => console.log("Call stub") }, { text: "OK" }]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <View style={styles.headerContent}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person-outline" size={40} color="#2563EB" />
                        </View>
                        <Text style={styles.userName}>UserName</Text>
                        <Text style={styles.userRole}>Field Inspector</Text>
                        <View style={styles.certificationBadge}>
                            <Ionicons name="shield-checkmark-outline" size={14} color="#D69E2E" />
                            <Text style={styles.certificationText}>Certified Safety Worker</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                {/* Device Info Card */}
                <View style={[styles.card, styles.deviceCard]}>
                    <Text style={styles.sectionTitle}>Device Information</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Device ID</Text>
                        <Text style={styles.infoValue}>DEV-5V9C8406N</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>ML Model Version</Text>
                        <Text style={styles.infoValue}>x.x.x</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Last Model Update</Text>
                        <Text style={styles.infoValue}>x.x.x</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>App Version</Text>
                        <Text style={styles.infoValue}>x.x.x</Text>
                    </View>
                </View>

                {/* Settings Items */}
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingIconBox}>
                        <Ionicons name="settings-outline" size={20} color="#2563EB" />
                    </View>
                    <View style={styles.settingTextBox}>
                        <Text style={styles.settingTitle}>App Settings</Text>
                        <Text style={styles.settingSubtitle}>Configure app preferences</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
                </TouchableOpacity>

                <View style={styles.settingItem}>
                    <View style={styles.settingIconBox}>
                        <Ionicons name="notifications-outline" size={20} color="#2563EB" />
                    </View>
                    <View style={styles.settingTextBox}>
                        <Text style={styles.settingTitle}>Notifications</Text>
                        <Text style={styles.settingSubtitle}>Manage alerts and notifications</Text>
                    </View>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: "#767577", true: "#2563EB" }}
                        thumbColor={"#f4f3f4"}
                    />
                </View>

                <View style={styles.settingItem}>
                    <View style={styles.settingIconBox}>
                        <Ionicons name="wifi-outline" size={20} color="#2563EB" />
                    </View>
                    <View style={styles.settingTextBox}>
                        <Text style={styles.settingTitle}>Auto Upload</Text>
                        <Text style={styles.settingSubtitle}>Upload reports when online</Text>
                    </View>
                    <Switch
                        value={autoUploadEnabled}
                        onValueChange={setAutoUploadEnabled}
                        trackColor={{ false: "#E2E8F0", true: "#2563EB" }}
                        thumbColor={"#f4f3f4"}
                    />
                </View>

                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingIconBox}>
                        <Ionicons name="server-outline" size={20} color="#2563EB" />
                    </View>
                    <View style={styles.settingTextBox}>
                        <Text style={styles.settingTitle}>Storage Management</Text>
                        <Text style={styles.settingSubtitle}>1.2 GB used</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem} onPress={showSafetyGuidelines}>
                    <View style={styles.settingIconBox}>
                        <Ionicons name="shield-outline" size={20} color="#2563EB" />
                    </View>
                    <View style={styles.settingTextBox}>
                        <Text style={styles.settingTitle}>Safety Guidelines</Text>
                        <Text style={styles.settingSubtitle}>View refinery safety protocols</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem} onPress={contactSupport}>
                    <View style={styles.settingIconBox}>
                        <Ionicons name="help-circle-outline" size={20} color="#2563EB" />
                    </View>
                    <View style={styles.settingTextBox}>
                        <Text style={styles.settingTitle}>Help & Support</Text>
                        <Text style={styles.settingSubtitle}>Contact safety officer</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
                </TouchableOpacity>

                {/* Offline Warning */}
                <View style={styles.offlineBanner}>
                    <View style={styles.offlineHeader}>
                        <View style={styles.offlineIcon}>
                            <Text style={styles.offlineIconText}>OFF</Text>
                        </View>
                        <Text style={styles.offlineTitle}>Offline Mode Active</Text>
                    </View>
                    <Text style={styles.offlineText}>
                        Reports are stored locally and will sync when network connection is available.
                    </Text>
                    <View style={styles.pendingRow}>
                        <Ionicons name="ellipse" size={8} color="#D69E2E" />
                        <Text style={styles.pendingText}>12 reports pending sync</Text>
                    </View>
                </View>

                {/* Logout/Switch Account Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="swap-horizontal-outline" size={20} color="#2B6CB0" />
                    <Text style={[styles.logoutText, { color: '#2B6CB0' }]}>SWITCH ACCOUNT</Text>
                </TouchableOpacity>

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
        backgroundColor: '#2563EB',
        paddingBottom: 100, // Increased to ensure no text overlap
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        alignItems: 'center',
        paddingTop: 10,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        color: '#BFDBFE',
        marginBottom: 8,
    },
    certificationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    certificationText: {
        color: '#D69E2E',
        fontWeight: '600',
        fontSize: 14,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    deviceCard: {
        marginTop: -60, // Overlap deeply but safely thanks to large header padding
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoLabel: {
        color: '#718096',
        fontSize: 14,
    },
    infoValue: {
        color: '#2D3748',
        fontWeight: '600',
        fontSize: 14,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    settingIconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F7FAFC', // Or light blue tint
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#EDF2F7',
    },
    settingTextBox: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D3748',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#718096',
    },
    offlineBanner: {
        backgroundColor: '#FEFCBF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F6E05E',
    },
    offlineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    offlineIcon: {
        backgroundColor: '#D69E2E',
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 2,
        marginRight: 8,
    },
    offlineIconText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 10,
    },
    offlineTitle: {
        color: '#744210',
        fontWeight: 'bold',
        fontSize: 14,
    },
    offlineText: {
        color: '#975A16',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 8,
    },
    pendingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pendingText: {
        color: '#744210',
        fontWeight: '600',
        fontSize: 13,
    },
    logoutBtn: {
        flexDirection: 'row',
        backgroundColor: '#FFF5F5',
        borderRadius: 16,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#FED7D7',
    },
    logoutText: {
        color: '#C53030',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 0.5,
    },
});
