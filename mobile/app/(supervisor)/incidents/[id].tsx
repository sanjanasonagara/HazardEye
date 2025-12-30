import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Modal, TouchableOpacity, Alert, SafeAreaView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { getIncidentById, Incident, updateIncidentStatus, getTasks, Task } from '../../../src/services/DatabaseMock';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardHeader, CardBody } from '../../../src/components/UI/Card';
import { Badge } from '../../../src/components/UI/Badge';
import { Button } from '../../../src/components/UI/Button';
import { AIRecommendationPanel, AIRecommendation } from '../../../src/components/AIRecommendationPanel';
import { format } from 'date-fns';

export default function IncidentDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [incident, setIncident] = useState<Incident | null>(null);
    const [relatedTasks, setRelatedTasks] = useState<Task[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'tasks'>('overview');
    const [showImageModal, setShowImageModal] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (typeof id === 'string') {
                const data = getIncidentById(id);
                setIncident(data);

                // Fetch tasks and filter for this incident
                const allTasks = getTasks();
                const related = allTasks.filter(t => t.incident_id === id);
                setRelatedTasks(related);
            }
        }, [id])
    );

    const handleCreateTask = () => {
        if (incident) {
            router.push({
                pathname: '/(supervisor)/tasks',
                params: {
                    createForIncident: incident.id,
                    initialArea: incident.area || '',
                    initialPlant: incident.plant || '',
                    initialDescription: `Check incident: ${incident.advisory || incident.note}`
                }
            });
        }
    };

    const handleCloseIncident = () => {
        if (!incident) return;
        Alert.alert(
            "Close Incident",
            "Are you sure you want to close this incident?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Close",
                    style: "destructive",
                    onPress: () => {
                        updateIncidentStatus(incident.id, 'closed');
                        setIncident(prev => prev ? { ...prev, status: 'closed' } : null);
                        Alert.alert("Success", "Incident closed.");
                    }
                }
            ]
        );
    };

    const handleVerifyIncident = () => {
        if (!incident) return;
        Alert.alert(
            "Verify Incident",
            "Mark this incident as Verified?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Verify",
                    onPress: () => {
                        updateIncidentStatus(incident.id, 'verified');
                        setIncident(prev => prev ? { ...prev, status: 'verified' } : null);
                    }
                }
            ]
        );
    };

    const aiRecommendation: AIRecommendation | null = useMemo(() => {
        if (!incident?.ml_metadata) return null;
        try {
            const meta = JSON.parse(incident.ml_metadata);
            // Check if it matches our AIRecommendation shape directly or if we need to adapt
            // Assuming for now it might be stored under a 'recommendation' key or flat.
            // Let's assume the DB might store it somewhat loosely, but we'll try to extract.
            // If the web already expects it, we can look for those keys.
            if (meta.whatToDo && meta.whyItMatters) {
                return meta as AIRecommendation;
            }
            // Fallback: Construct it if simple ML detection only
            if (meta.detections) {
                return {
                    whatToDo: "Inspect the area immediately.",
                    whyItMatters: "Potential safety violation detected by automated system.",
                    riskExplanation: incident.advisory || "Anomaly detected.",
                    preventiveSteps: ["Check equipment status", "Clear the area"]
                };
            }
            return null;
        } catch (e) {
            return null;
        }
    }, [incident]);

    if (!incident) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    let imageUrl = null;
    try {
        const media = JSON.parse(incident.media_uris || '[]');
        if (Array.isArray(media) && media.length > 0) imageUrl = media[0];
    } catch (e) { }

    const isClosed = incident.status === 'closed';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1A202C" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Incident Details</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {/* Placeholder for Download Button logic if feasible, skipping for now as per instructions to stick to UI */}
                </View>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.content}>

                {/* ID Header */}
                <View style={styles.idHeader}>
                    <Text style={styles.idText}>ID: {incident.id}</Text>
                    <View style={styles.actionButtons}>
                        {!isClosed && (
                            <Button size="sm" variant="outline" onPress={handleCreateTask} icon={<Ionicons name="add" size={16} color="#4A5568" />}>
                                Task
                            </Button>
                        )}
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    {(['overview', 'analysis', 'tasks'] as const).map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'tasks' && `(${relatedTasks.length})`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {activeTab === 'overview' && (
                    <View style={styles.tabContent}>
                        <Card>
                            <CardBody style={{ padding: 0 }}>
                                <View style={styles.overviewContainer}>
                                    {/* Image Section */}
                                    <TouchableOpacity style={styles.imageSection} onPress={() => setShowImageModal(true)}>
                                        {imageUrl ? (
                                            <Image source={{ uri: imageUrl }} style={styles.mainImage} resizeMode="cover" />
                                        ) : (
                                            <View style={styles.placeholderImage}>
                                                <Ionicons name="image-outline" size={48} color="#CBD5E0" />
                                            </View>
                                        )}
                                        <View style={styles.expandIcon}>
                                            <Ionicons name="expand" size={16} color="#4A5568" />
                                        </View>
                                    </TouchableOpacity>

                                    {/* Metadata Section */}
                                    <View style={styles.metaSection}>
                                        <View style={styles.descSection}>
                                            <Text style={styles.label}>DESCRIPTION</Text>
                                            <Text style={styles.descriptionText}>
                                                {incident.advisory || incident.note || 'No description provided.'}
                                            </Text>
                                        </View>

                                        <View style={styles.grid}>
                                            <View style={styles.gridItem}>
                                                <Text style={styles.label}>STATUS</Text>
                                                <Badge variant={incident.status}>{incident.status}</Badge>
                                            </View>
                                            <View style={styles.gridItem}>
                                                <Text style={styles.label}>SEVERITY</Text>
                                                <Badge variant={incident.severity >= 0.7 ? 'High' : incident.severity >= 0.4 ? 'Medium' : 'Low'}>
                                                    {incident.severity >= 0.7 ? 'High' : incident.severity >= 0.4 ? 'Medium' : 'Low'} ({incident.severity.toFixed(2)})
                                                </Badge>
                                            </View>
                                            <View style={styles.gridItem}>
                                                <Text style={styles.label}>DEPARTMENT</Text>
                                                <Text style={styles.valueText}>{incident.department || 'N/A'}</Text>
                                            </View>
                                            <View style={styles.gridItem}>
                                                <Text style={styles.label}>AREA / PLANT</Text>
                                                <Text style={styles.valueText}>{incident.area || 'Unknown'}</Text>
                                                <Text style={styles.subValueText}>{incident.plant}</Text>
                                            </View>

                                            <View style={[styles.gridItem, { width: '100%', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#EDF2F7' }]}>
                                                <Text style={styles.label}>REPORTED AT</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <Ionicons name="calendar-outline" size={14} color="#718096" />
                                                    <Text style={styles.dateValue}>{format(new Date(incident.created_at), 'MMM d, yyyy h:mm a')}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </CardBody>
                        </Card>

                        {/* Actions */}
                        <View style={styles.actionRow}>
                            {incident.status !== 'verified' && !isClosed && (
                                <Button onPress={handleVerifyIncident} style={{ flex: 1, backgroundColor: '#48BB78' }} icon={<Ionicons name="checkmark-circle-outline" size={18} color="#fff" />}>
                                    Verify
                                </Button>
                            )}
                            {!isClosed ? (
                                <Button onPress={handleCloseIncident} variant="danger" style={{ flex: 1 }} icon={<Ionicons name="close-circle-outline" size={18} color="#fff" />}>
                                    Close Incident
                                </Button>
                            ) : (
                                <View style={styles.closedBanner}>
                                    <Ionicons name="lock-closed" size={18} color="#718096" />
                                    <Text style={{ fontStyle: 'italic', color: '#718096' }}>This incident is resolved.</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {activeTab === 'analysis' && (
                    <View style={styles.tabContent}>
                        {aiRecommendation ? (
                            <AIRecommendationPanel recommendation={aiRecommendation} />
                        ) : (
                            <Card>
                                <CardBody style={{ alignItems: 'center', padding: 32 }}>
                                    <Ionicons name="analytics-outline" size={48} color="#CBD5E0" />
                                    <Text style={{ marginTop: 16, color: '#718096' }}>No AI analysis available for this incident.</Text>
                                </CardBody>
                            </Card>
                        )}
                        {/* Summary of advisory if not redundant */}
                        {incident.note && (
                            <Card>
                                <CardHeader><Text style={{ fontWeight: 'bold' }}>Inspector Notes</Text></CardHeader>
                                <CardBody><Text style={{ color: '#4A5568' }}>{incident.note}</Text></CardBody>
                            </Card>
                        )}
                    </View>
                )}

                {activeTab === 'tasks' && (
                    <View style={styles.tabContent}>
                        {relatedTasks.length === 0 ? (
                            <Card>
                                <CardBody style={{ alignItems: 'center', padding: 32 }}>
                                    <Text style={{ color: '#718096' }}>No tasks linked to this incident.</Text>
                                    {!isClosed && (
                                        <Button variant="outline" onPress={handleCreateTask} style={{ marginTop: 16 }}>
                                            Create Task
                                        </Button>
                                    )}
                                </CardBody>
                            </Card>
                        ) : (
                            relatedTasks.map(task => (
                                <Card key={task.id}>
                                    <CardBody>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 4 }}>{task.title}</Text>
                                                <Text style={{ color: '#718096', fontSize: 13, marginBottom: 8 }}>{task.description}</Text>
                                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                                    <Badge variant={task.status}>{task.status}</Badge>
                                                    <Badge variant={task.priority}>{task.priority}</Badge>
                                                </View>
                                                <Text style={{ fontSize: 12, color: '#A0AEC0', marginTop: 8 }}>
                                                    Assigned to: {task.assignee}
                                                </Text>
                                            </View>
                                            <Button size="sm" variant="outline" onPress={() => router.push(`/(supervisor)/tasks/${task.id}`)}>
                                                View
                                            </Button>
                                        </View>
                                    </CardBody>
                                </Card>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Image Modal */}
            <Modal visible={showImageModal} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalClose} onPress={() => setShowImageModal(false)}>
                        <Ionicons name="close" size={32} color="#fff" />
                    </TouchableOpacity>
                    <Image source={{ uri: imageUrl }} style={styles.fullImage} resizeMode="contain" />
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A202C' },
    idHeader: {
        padding: 16,
        paddingBottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    idText: {
        fontSize: 14,
        color: '#718096',
        fontFamily: 'SpaceMono-Regular',
    },
    actionButtons: { flexDirection: 'row', gap: 8 },
    content: { paddingBottom: 40 },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        marginTop: 16,
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 4,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#2563EB',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#718096',
    },
    activeTabText: {
        color: '#2563EB',
    },
    tabContent: {
        padding: 16,
        gap: 16,
    },

    // Overview styles
    overviewContainer: {
        // Imitating the flex-row from web on tablet, but col on mobile usually. 
        // We'll keep it col for mobile optimization.
        flexDirection: 'column',
    },
    imageSection: {
        height: 250,
        backgroundColor: '#EDF2F7',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    mainImage: { width: '100%', height: '100%' },
    placeholderImage: { alignItems: 'center', justifyContent: 'center' },
    expandIcon: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 6,
        borderRadius: 4,
    },
    metaSection: {
        padding: 16,
        backgroundColor: '#F8FAFC',
    },
    descSection: {
        marginBottom: 20,
    },
    descriptionText: {
        fontSize: 15,
        color: '#2D3748',
        lineHeight: 22,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    gridItem: {
        width: '45%', // roughly 2 cols
        gap: 4,
    },
    label: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#A0AEC0',
        textTransform: 'uppercase',
    },
    valueText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D3748',
    },
    subValueText: {
        fontSize: 12,
        color: '#718096',
    },
    dateValue: {
        fontSize: 13,
        color: '#4A5568',
    },

    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    closedBanner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#E2E8F0',
        borderRadius: 8,
        gap: 8,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalClose: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
    fullImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.8,
    },
});
