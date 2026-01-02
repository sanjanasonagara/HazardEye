import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { getTaskById, Task, updateTaskStatus, addTaskComment, getIncidentById, Incident, TaskComment } from '../../../src/services/Database';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardHeader, CardBody } from '../../../src/components/UI/Card';
import { Badge } from '../../../src/components/UI/Badge';
import { Button } from '../../../src/components/UI/Button';
import { format, formatDistanceToNow } from 'date-fns';

export default function WorkerTaskDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [task, setTask] = useState<Task | null>(null);
    const [linkedIncident, setLinkedIncident] = useState<Incident | null>(null);

    // Modals
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [showDelayModal, setShowDelayModal] = useState(false);

    // Form States
    const [commentText, setCommentText] = useState('');
    const [delayReason, setDelayReason] = useState('');

    useFocusEffect(
        useCallback(() => {
            if (typeof id === 'string') {
                loadData(id);
            }
        }, [id])
    );

    const loadData = async (taskId: string) => {
        const data = await getTaskById(taskId);
        setTask(data);
        if (data?.incident_id) {
            const inc = await getIncidentById(data.incident_id);
            setLinkedIncident(inc);
        }
    };

    if (!task) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <SafeAreaView>
                    <Text>Loading...</Text>
                </SafeAreaView>
            </View>
        );
    }

    const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'Completed';

    const handleMarkDone = async () => {
        await updateTaskStatus(task.id, 'Completed');
        Alert.alert("Success", "Task marked as completed.");
        await loadData(task.id);
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) return;
        await addTaskComment(task.id, commentText);
        setCommentText('');
        setShowCommentModal(false);
        await loadData(task.id);
    };

    const handleDelaySubmit = async () => {
        if (!delayReason.trim()) return;
        await updateTaskStatus(task.id, 'Delayed', delayReason, new Date().toISOString());
        setDelayReason('');
        setShowDelayModal(false);
        await loadData(task.id);
    };

    const comments = JSON.parse(task.comments || '[]') as (string | TaskComment)[];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <View style={styles.headerContentInner}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#1A202C" />
                            <Text style={styles.backText}>Back</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={styles.headerTitle} numberOfLines={1}>Task Details</Text>
                            <Text style={styles.headerSub}>ID: {task.id}</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Status Bar */}
                <View style={styles.actionBar}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <Badge variant={task.status as any}>{task.status}</Badge>
                        <Badge variant={task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase() as any}>{task.priority}</Badge>
                    </View>
                </View>

                {/* Main Info */}
                <Card style={styles.mainCard}>
                    <CardBody>
                        <Text style={styles.sectionLabel}>DESCRIPTION</Text>
                        <Text style={styles.descriptionText}>{task.description}</Text>

                        <View style={styles.grid}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>AREA</Text>
                                <Text style={styles.valueText}>{task.area}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>PLANT</Text>
                                <Text style={styles.valueText}>{task.plant}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>DUE DATE</Text>
                                <Text style={styles.valueText}>
                                    {task.due_date && !isNaN(new Date(task.due_date).getTime())
                                        ? format(new Date(task.due_date), 'MMM d, yyyy')
                                        : 'TBD'}
                                </Text>
                            </View>
                        </View>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="shield-checkmark" size={20} color="#D69E2E" />
                            <Text style={styles.cardTitle}>Precautions & Advisory</Text>
                        </View>
                    </CardHeader>
                    <CardBody>
                        <Text style={styles.bodyText}>{task.precautions || "No specific precautions listed."}</Text>
                    </CardBody>
                </Card>

                {(task.delay_reason || (task.delay_history && task.delay_history !== '[]')) && (
                    <Card style={{ borderColor: '#FBD38D', borderWidth: 1 }}>
                        <CardHeader><Text style={[styles.cardTitle, { color: '#C05621' }]}>Delay History</Text></CardHeader>
                        <CardBody>
                            {/* Fallback for old data or if history is empty but reason exists */}
                            {(!task.delay_history || task.delay_history === '[]') && task.delay_reason && (
                                <View style={{ marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#FEEBC8' }}>
                                    <Text style={{ fontWeight: '600', color: '#C05621' }}>{task.delay_reason}</Text>
                                    {task.delayed_at && !isNaN(new Date(task.delayed_at).getTime()) && (
                                        <Text style={{ fontSize: 12, color: '#975A16', marginTop: 4 }}>
                                            Reported {formatDistanceToNow(new Date(task.delayed_at), { addSuffix: true })}
                                        </Text>
                                    )}
                                </View>
                            )}

                            {/* Render History */}
                            {task.delay_history && (() => {
                                try {
                                    const history = JSON.parse(task.delay_history) as { reason: string, timestamp: string }[];
                                    return history.map((h, i) => (
                                        <View key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottomWidth: i === history.length - 1 ? 0 : 1, borderBottomColor: '#FEEBC8' }}>
                                            <Text style={{ fontWeight: '600', color: '#C05621' }}>{h.reason}</Text>
                                            {h.timestamp && !isNaN(new Date(h.timestamp).getTime()) && (
                                                <Text style={{ fontSize: 12, color: '#975A16', marginTop: 4 }}>
                                                    {formatDistanceToNow(new Date(h.timestamp), { addSuffix: true })}
                                                </Text>
                                            )}
                                        </View>
                                    ));
                                } catch (e) { return null; }
                            })()}
                        </CardBody>
                    </Card>
                )}

                {/* Comments */}
                <Card>
                    <CardHeader style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.cardTitle}>Comments & Activity</Text>
                        <Button variant="outline" size="sm" onPress={() => setShowCommentModal(true)}>
                            <Ionicons name="chatbox" size={14} color="#4A5568" style={{ marginRight: 4 }} /> Add
                        </Button>
                    </CardHeader>
                    <CardBody>
                        {comments.length === 0 ? (
                            <Text style={styles.emptyText}>No comments yet.</Text>
                        ) : (
                            <View style={{ gap: 12 }}>
                                {comments.map((c, i) => {
                                    const isNewFormat = typeof c === 'object' && c !== null && 'text' in c;
                                    const text = isNewFormat ? c.text : c as string;
                                    const timestamp = isNewFormat ? c.timestamp : null;

                                    return (
                                        <View key={i} style={styles.commentBox}>
                                            <Text style={styles.commentContent}>{text}</Text>
                                            {timestamp && !isNaN(new Date(timestamp).getTime()) && (
                                                <Text style={styles.commentTime}>
                                                    {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                                                </Text>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </CardBody>
                </Card>

                {linkedIncident && (
                    <TouchableOpacity style={{ marginTop: 8 }} onPress={() => router.push('/(tabs)/incidents/' + linkedIncident.id)}>
                        <Card>
                            <CardHeader><Text style={styles.cardTitle}>Linked Incident</Text></CardHeader>
                            <CardBody>
                                <Text style={styles.bodyText} numberOfLines={2}>{linkedIncident.note}</Text>
                            </CardBody>
                        </Card>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Comment Modal */}
            <Modal visible={showCommentModal} transparent animationType="fade" onRequestClose={() => setShowCommentModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Add Comment</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { marginTop: 12 }]}
                            multiline
                            placeholder="Type your comment..."
                            value={commentText}
                            onChangeText={setCommentText}
                            autoFocus
                        />
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, justifyContent: 'flex-end' }}>
                            <Button variant="outline" onPress={() => setShowCommentModal(false)}>Cancel</Button>
                            <Button onPress={handleAddComment}>Post</Button>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delay Modal */}
            <Modal visible={showDelayModal} transparent animationType="fade" onRequestClose={() => setShowDelayModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Report Delay</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { marginTop: 12 }]}
                            multiline
                            placeholder="Reason for delay..."
                            value={delayReason}
                            onChangeText={setDelayReason}
                            autoFocus
                        />
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, justifyContent: 'flex-end' }}>
                            <Button variant="outline" onPress={() => setShowDelayModal(false)}>Cancel</Button>
                            <Button onPress={handleDelaySubmit} variant="danger" style={{ backgroundColor: '#D69E2E' }}>Report</Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0'
    },
    headerContentInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 8,
        paddingBottom: 12,
    },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    backText: { fontSize: 16, color: '#1A202C' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A202C' },
    headerSub: { fontSize: 12, color: '#718096' },
    content: { padding: 16, gap: 16 },
    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 1,
    },
    mainCard: {
        borderRadius: 12,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#A0AEC0',
        marginBottom: 8,
        letterSpacing: 1,
    },
    descriptionText: {
        fontSize: 16,
        color: '#2D3748',
        lineHeight: 24,
        marginBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
    },
    gridItem: {
        paddingRight: 20,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#CBD5E0',
        marginBottom: 4,
    },
    valueText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#2D3748' },
    bodyText: { fontSize: 14, color: '#4A5568', lineHeight: 20 },
    emptyText: { textAlign: 'center', color: '#A0AEC0', padding: 20 },
    commentBox: {
        backgroundColor: '#F7FAFC',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#2563EB',
    },
    commentContent: { fontSize: 14, color: '#4A5568' },
    commentTime: { fontSize: 10, color: '#A0AEC0', marginTop: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 16 },
    textArea: { height: 100, textAlignVertical: 'top' },
});
