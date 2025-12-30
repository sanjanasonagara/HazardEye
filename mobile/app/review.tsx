import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { getIncidentById, updateIncident, saveIncident, Incident } from '../src/services/DatabaseMock';

// Mock locations
const LOCATIONS = [
    "Unit A-1 Processing",
    "Unit A-2 Storage",
    "Unit B-5 Reactor",
    "Control Room",
    "Maintenance Bay",
    "Storage Yard",
    "Loading Dock",
    "Administration"
];

export default function ReviewScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const imageUri = params.imageUri as string;
    const existingId = params.incidentId as string;

    // Form State
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState<number>(1); // 1=Low, 2=Medium, 3=High
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [incidentId, setIncidentId] = useState(`INC-${Math.floor(Math.random() * 900000) + 100000}`);
    const [timestamp] = useState(new Date());
    const [isEditing, setIsEditing] = useState(false);
    const [displayImage, setDisplayImage] = useState<string | null>(imageUri || null);

    // Load existing data if editing
    useEffect(() => {
        if (existingId) {
            const incident = getIncidentById(existingId);
            if (incident) {
                setIncidentId(incident.id);
                setDescription(incident.advisory);
                setSeverity(incident.severity);
                setSeverity(incident.severity);
                setSelectedLocation(incident.note);
                if (incident.media_uris) {
                    try {
                        const media = JSON.parse(incident.media_uris);
                        if (media.length > 0) setDisplayImage(media[0]);
                    } catch (e) {
                        console.log("Error parsing media URIs", e);
                    }
                }
                setIsEditing(true);
            }
        }
    }, [existingId]);

    const handleSave = () => {
        if (!selectedLocation) {
            Alert.alert("Missing Details", "Please select a location.");
            return;
        }

        if (isEditing) {
            const updatedIncident: Incident = {
                id: incidentId,
                created_at: timestamp.toISOString(), // Keep original timestamp? Ideally yes, but logic simplifies to new date for now or fetch orig.
                media_uris: JSON.stringify([]), // Not updating media for now
                ml_metadata: '{}',
                advisory: description,
                severity,
                sync_status: 'pending',
                note: selectedLocation
            };

            // We need to pass the FULL incident to update, but Database.ts updateIncident only updates mutable fields.
            // Let's rely on the DB function we just made which only touches advisory, severity, note.
            try {
                updateIncident(updatedIncident);
                Alert.alert("Success", "Incident updated.", [
                    { text: "OK", onPress: () => router.dismissTo('/(tabs)/history') }
                ]);
            } catch (e) {
                console.error(e);
                Alert.alert("Error", "Failed to update incident.");
            }
        } else {
            const newIncident: Incident = {
                id: incidentId,
                created_at: timestamp.toISOString(),
                media_uris: JSON.stringify([imageUri || '']), // Store as array
                ml_metadata: '{}', // Placeholder
                advisory: description,
                severity,
                sync_status: 'pending',
                note: selectedLocation
            };

            try {
                saveIncident(newIncident);
                Alert.alert("Success", "Incident saved offline.", [
                    { text: "OK", onPress: () => router.dismissTo('/(tabs)') }
                ]);
            } catch (e) {
                console.error(e);
                Alert.alert("Error", "Failed to save incident.");
            }
        }
    };

    return (
        <View style={styles.mainContainer}>
            {/* Header */}
            <View style={styles.header}>
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.headerTitle}>{isEditing ? 'Edit Report Details' : 'Add Report Details'}</Text>
                            <Text style={styles.headerSubtitle}>{isEditing ? 'Update incident information' : 'Complete incident information'}</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Incident ID Card */}
                <View style={styles.card}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Incident ID</Text>
                        <Text style={styles.idText}>{incidentId}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>SAVED OFFLINE</Text>
                    </View>
                </View>

                {/* Evidence Image */}
                {displayImage && (
                    <View style={styles.card}>
                        <Text style={styles.label}>Captured Evidence</Text>
                        <Image source={{ uri: displayImage }} style={styles.evidenceImage} resizeMode="cover" />
                    </View>
                )}

                {/* Description */}
                <View style={styles.card}>
                    <Text style={styles.label}>Description of Issue</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Describe what you observed..."
                        multiline
                        numberOfLines={4}
                        value={description}
                        onChangeText={setDescription}
                        textAlignVertical="top"
                    />
                </View>

                {/* Severity */}
                <View style={styles.card}>
                    <Text style={styles.label}>Severity Level</Text>
                    <View style={styles.severityContainer}>
                        <TouchableOpacity
                            style={[styles.severityBtn, severity === 1 && styles.severityLowSelected]}
                            onPress={() => setSeverity(1)}
                        >
                            <Ionicons name="caret-up" size={24} color={severity === 1 ? "#059669" : "#D1D5DB"} />
                            <Text style={[styles.severityTitle, severity === 1 && { color: '#059669' }]}>Low</Text>
                            <Text style={styles.severityDesc}>Observation</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.severityBtn, severity === 2 && styles.severityMedSelected]}
                            onPress={() => setSeverity(2)}
                        >
                            <Ionicons name="alert-circle" size={24} color={severity === 2 ? "#D97706" : "#D1D5DB"} />
                            <Text style={[styles.severityTitle, severity === 2 && { color: '#D97706' }]}>Medium</Text>
                            <Text style={styles.severityDesc}>Warning</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.severityBtn, severity === 3 && styles.severityHighSelected]}
                            onPress={() => setSeverity(3)}
                        >
                            <Ionicons name="warning" size={24} color={severity === 3 ? "#DC2626" : "#D1D5DB"} />
                            <Text style={[styles.severityTitle, severity === 3 && { color: '#DC2626' }]}>High</Text>
                            <Text style={styles.severityDesc}>Immediate Action</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Location */}
                <View style={styles.card}>
                    <Text style={styles.label}>Location / Unit</Text>
                    <View style={styles.locationList}>
                        {LOCATIONS.map((loc, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.locationItem}
                                onPress={() => setSelectedLocation(loc)}
                            >
                                <View style={styles.locationRow}>
                                    <Ionicons name="location-outline" size={20} color="#4B5563" />
                                    <Text style={styles.locationText}>{loc}</Text>
                                </View>
                                <View style={[styles.radio, selectedLocation === loc && styles.radioSelected]} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Timestamp */}
                <View style={styles.card}>
                    <Text style={styles.label}>Incident Timestamp</Text>
                    <View style={styles.timestampBox}>
                        <Ionicons name="calendar-outline" size={20} color="#4B5563" />
                        <Text style={styles.timestampText}>
                            {timestamp.toLocaleString()}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                    </View>
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                        <Ionicons name="alert-circle" size={20} color="#D97706" />
                        <Text style={styles.infoTitle}>Before Saving</Text>
                    </View>
                    <Text style={styles.infoText}>• Verify all details are accurate</Text>
                    <Text style={styles.infoText}>• Ensure proper severity level</Text>
                    <Text style={styles.infoText}>• Double-check location information</Text>
                    <Text style={styles.infoText}>• This report will be stored offline until sync</Text>
                </View>

            </ScrollView>

            {/* Footer Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Ionicons name={isEditing ? "checkmark-circle-outline" : "save-outline"} size={24} color="#fff" />
                    <Text style={styles.saveButtonText}>{isEditing ? 'UPDATE REPORT' : 'SAVE OFFLINE REPORT'}</Text>
                </TouchableOpacity>
                <Text style={styles.footerNote}>
                    Report will sync automatically when network is available
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        backgroundColor: '#2563EB',
        paddingBottom: 20,
        paddingHorizontal: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#BFDBFE',
    },
    content: {
        padding: 16,
        gap: 16,
        paddingBottom: 100, // Space for footer
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    idText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2563EB',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F59E0B',
    },
    statusText: {
        color: '#D97706',
        fontWeight: 'bold',
        fontSize: 12,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        height: 100,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },
    severityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    severityBtn: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    severityLowSelected: {
        backgroundColor: '#ECFDF5',
        borderColor: '#059669',
    },
    severityMedSelected: {
        backgroundColor: '#FFFBEB',
        borderColor: '#D97706',
    },
    severityHighSelected: {
        backgroundColor: '#FEF2F2',
        borderColor: '#DC2626',
    },
    severityTitle: {
        fontWeight: 'bold',
        marginTop: 4,
        color: '#4B5563',
    },
    severityDesc: {
        fontSize: 10,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 2,
    },
    locationList: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        overflow: 'hidden',
    },
    locationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#fff',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    locationText: {
        fontSize: 16,
        color: '#374151',
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
    },
    radioSelected: {
        borderColor: '#2563EB',
        borderWidth: 6,
    },
    timestampBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#F9FAFB',
    },
    timestampText: {
        fontSize: 16,
        color: '#374151',
    },
    infoCard: {
        backgroundColor: '#FFFBEB', // Amber-50
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    infoTitle: {
        color: '#92400E',
        fontWeight: 'bold',
        fontSize: 16,
    },
    infoText: {
        color: '#B45309',
        fontSize: 14,
        marginBottom: 4,
        paddingLeft: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        elevation: 10,
    },
    saveButton: {
        backgroundColor: '#2563EB',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footerNote: {
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 12,
        marginTop: 12,
    },
    evidenceImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginTop: 4,
        backgroundColor: '#F3F4F6',
    },
});
