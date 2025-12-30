import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { getTaskById, Task, updateTaskStatus, addTaskComment, deleteTask, updateTaskDetails, getIncidentById, Incident, TaskComment } from '../../../src/services/DatabaseMock';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardHeader, CardBody } from '../../../src/components/UI/Card';
import { Badge } from '../../../src/components/UI/Badge';
import { Button } from '../../../src/components/UI/Button';
import { format } from 'date-fns';

type TabType = 'overview' | 'resolution' | 'incident';

export default function TaskDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [task, setTask] = useState<Task | null>(null);
    const [linkedIncident, setLinkedIncident] = useState<Incident | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Modals
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [showDelayModal, setShowDelayModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Form States
    const [commentText, setCommentText] = useState('');
    const [delayReason, setDelayReason] = useState('');
    const [editForm, setEditForm] = useState<Partial<Task>>({});

    const [isDeleting, setIsDeleting] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [id])
    );

    const loadData = () => {
        if (typeof id === 'string') {
            const data = getTaskById(id);
            setTask(data);
            if (data?.incident_id) {
                const inc = getIncidentById(data.incident_id);
                setLinkedIncident(inc);
            }
        }
    };

    if (!task) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'Completed';

    // -- Actions --

    const handleMarkDone = () => {
        updateTaskStatus(task.id, 'Completed');
        Alert.alert("Success", "Task marked as completed.");
        loadData();
    };

    const handleDeleteTask = () => {
        Alert.alert(
            "Delete Task",
            "Are you sure you want to delete this task?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteTask(task.id);
                        router.back();
                    }
                }
            ]
        );
    };

    const handleAddComment = () => {
        if (!commentText.trim()) return;
        const newComment: TaskComment = {
            id: Date.now().toString(),
            taskId: task.id,
            userId: 'current-user', // Mock
            userName: 'Current User',
            userRole: 'supervisor',
            content: commentText,
            timestamp: new Date().toISOString()
        };
        addTaskComment(task.id, newComment);
        setCommentText('');
        setShowCommentModal(false);
        loadData();
    };

    const handleDelaySubmit = () => {
        if (!delayReason.trim()) return;
        updateTaskStatus(task.id, 'Delayed', delayReason);
        setDelayReason('');
        setShowDelayModal(false);
        loadData();
    };

    const handleEditOpen = () => {
        setEditForm({
            description: task.description,
            area: task.area,
            plant: task.plant,
            due_date: task.due_date,
            priority: task.priority,
            precautions: task.precautions
        });
        setShowEditModal(true);
    };

    const handleEditSave = () => {
        updateTaskDetails(task.id, editForm);
        setShowEditModal(false);
        loadData();
    };

    // -- Renders --

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            {(['overview', 'resolution', 'incident'] as TabType[]).map(tab => (
                <TouchableOpacity
                    key={tab}
                    style={[styles.tab, activeTab === tab && styles.tabActive]}
                    onPress={() => setActiveTab(tab)}
                >
                    <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                        {tab === 'incident' ? `Linked Incident (${linkedIncident ? 1 : 0})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderOverview = () => {
        const comments = JSON.parse(task.comments || '[]') as TaskComment[];

        return (
            <View style={{ gap: 16 }}>
                <Card>
                    <CardHeader><Text style={styles.cardTitle}>Description</Text></CardHeader>
                    <CardBody><Text style={styles.bodyText}>{task.description}</Text></CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="alert-circle" size={20} color="#D69E2E" />
                            <Text style={styles.cardTitle}>Precautions & Advisory</Text>
                        </View>
                    </CardHeader>
                    <CardBody>
                        <Text style={styles.bodyText}>{task.precautions || "No specific precautions listed."}</Text>
                    </CardBody>
                </Card>

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
                                {comments.map((c, i) => (
                                    <View key={i} style={styles.commentBox}>
                                        <View style={styles.commentHeader}>
                                            <Text style={styles.commentUser}>{c.userName}</Text>
                                            <Text style={styles.commentTime}>{new Date(c.timestamp).toLocaleString()}</Text>
                                        </View>
                                        <Text style={styles.commentContent}>{c.content}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </CardBody>
                </Card>

                {/* Delay History */}
                {task.delayHistory && task.delayHistory.length > 0 && (
                    <Card style={{ borderColor: '#FBD38D', borderWidth: 1 }}>
                        <CardHeader><Text style={[styles.cardTitle, { color: '#C05621' }]}>Delay History</Text></CardHeader>
                        <CardBody>
                            {task.delayHistory.map((h, i) => (
                                <View key={i} style={{ marginBottom: 8 }}>
                                    <Text style={{ fontWeight: '600', color: '#C05621' }}>{h.reason}</Text>
                                    <Text style={{ fontSize: 10, color: '#718096' }}>{new Date(h.date).toLocaleString()}</Text>
                                </View>
                            ))}
                        </CardBody>
                    </Card>
                )}
            </View>
        );
    };

    const renderResolution = () => (
        <Card>
            <CardHeader><Text style={styles.cardTitle}>Task Metadata</Text></CardHeader>
            <CardBody>
                <View style={styles.metaSection}>
                    <Text style={styles.metaLabel}>ASSIGNMENT</Text>
                    <View style={styles.metaRow}>
                        <Ionicons name="person" size={16} color="#3182CE" />
                        <View>
                            <Text style={styles.metaValue}>{task.assignedToName || task.assignee}</Text>
                            <Text style={styles.metaSub}>Assigned To</Text>
                        </View>
                    </View>
                    <View style={styles.metaRow}>
                        <Ionicons name="person-outline" size={16} color="#718096" />
                        <View>
                            <Text style={styles.metaValue}>{task.createdByName || 'System'}</Text>
                            <Text style={styles.metaSub}>Created By</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.metaSection, { borderTopWidth: 1, borderTopColor: '#EDF2F7', paddingTop: 16 }]}>
                    <Text style={styles.metaLabel}>LOCATION</Text>
                    <View style={styles.metaRow}>
                        <Ionicons name="location" size={16} color="#718096" />
                        <View>
                            <Text style={styles.metaValue}>{task.area}</Text>
                            <Text style={styles.metaSub}>Area</Text>
                        </View>
                    </View>
                    <View style={styles.metaRow}>
                        <Ionicons name="business" size={16} color="#718096" />
                        <View>
                            <Text style={styles.metaValue}>{task.plant}</Text>
                            <Text style={styles.metaSub}>Plant</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.metaSection, { borderTopWidth: 1, borderTopColor: '#EDF2F7', paddingTop: 16 }]}>
                    <Text style={styles.metaLabel}>PRIORITY & RISK</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Badge variant={task.priority}>{task.priority}</Badge>
                        {isOverdue && (
                            <View style={styles.overdueBadge}>
                                <Ionicons name="alert" size={12} color="#C53030" />
                                <Text style={styles.overdueText}>OVERDUE</Text>
                            </View>
                        )}
                    </View>
                </View>
            </CardBody>
        </Card>
    );

    const renderIncident = () => (
        <View>
            {linkedIncident ? (
                <TouchableOpacity onPress={() => router.push(`/(supervisor)/incidents/${linkedIncident.id}`)}>
                    <Card>
                        <CardBody>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                {/* Placeholder for Incident Image if available, logic same as Incident List */}
                                <View style={{ width: 80, height: 80, backgroundColor: '#EDF2F7', borderRadius: 8 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.cardTitle} numberOfLines={1}>{linkedIncident.department} Issue</Text>
                                    <Text numberOfLines={2} style={styles.bodyText}>{linkedIncident.advisory}</Text>
                                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                                        <Badge variant={linkedIncident.status}>{linkedIncident.status}</Badge>
                                    </View>
                                </View>
                            </View>
                        </CardBody>
                    </Card>
                </TouchableOpacity>
            ) : (
                <View style={{ alignItems: 'center', padding: 40 }}>
                    <Ionicons name="link-outline" size={48} color="#CBD5E0" />
                    <Text style={{ color: '#A0AEC0', marginTop: 12 }}>No incident linked to this task.</Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1A202C" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.headerTitle} numberOfLines={1}>Task Details</Text>
                    <Text style={styles.headerSub}>ID: {task.id}</Text>
                </View>
                {/* Header Actions */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button variant="ghost" size="sm" onPress={handleEditOpen}><Ionicons name="create-outline" size={20} /></Button>
                    <Button variant="ghost" size="sm" onPress={handleDeleteTask}><Ionicons name="trash-outline" size={20} color="#C53030" /></Button>
                </View>
            </View>

            {/* Quick Actions Bar */}
            <View style={styles.actionBar}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <Badge variant={task.status}>{task.status}</Badge>
                    <Badge variant={task.priority}>{task.priority}</Badge>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {task.status !== 'Completed' && (
                        <Button onPress={handleMarkDone} size="sm" style={{ backgroundColor: '#48BB78' }}>Done</Button>
                    )}
                    {task.status !== 'Completed' && isOverdue && (
                        <Button onPress={() => setShowDelayModal(true)} size="sm" variant="outline" style={{ borderColor: '#ECC94B' }}>Delay</Button>
                    )}
                </View>
            </View>

            {renderTabs()}

            <ScrollView contentContainerStyle={styles.content}>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'resolution' && renderResolution()}
                {activeTab === 'incident' && renderIncident()}
            </ScrollView>

            {/* Edit Modal */}
            <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FAFC' }}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edit Task</Text>
                        <TouchableOpacity onPress={() => setShowEditModal(false)}><Ionicons name="close" size={24} /></TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput style={[styles.input, styles.textArea]} multiline value={editForm.description} onChangeText={t => setEditForm({ ...editForm, description: t })} />
                        </View>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Area</Text>
                                <TextInput style={styles.input} value={editForm.area} onChangeText={t => setEditForm({ ...editForm, area: t })} />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Plant</Text>
                                <TextInput style={styles.input} value={editForm.plant} onChangeText={t => setEditForm({ ...editForm, plant: t })} />
                            </View>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Precautions</Text>
                            <TextInput style={[styles.input, styles.textArea]} multiline value={editForm.precautions} onChangeText={t => setEditForm({ ...editForm, precautions: t })} />
                        </View>
                        <Button onPress={handleEditSave}>Save Changes</Button>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Comment Modal */}
            <Modal visible={showCommentModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Add Comment</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { marginTop: 12 }]}
                            multiline
                            placeholder="Type your comment..."
                            value={commentText}
                            onChangeText={setCommentText}
                        />
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, justifyContent: 'flex-end' }}>
                            <Button variant="outline" onPress={() => setShowCommentModal(false)}>Cancel</Button>
                            <Button onPress={handleAddComment}>Post</Button>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delay Modal */}
            <Modal visible={showDelayModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Report Delay</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { marginTop: 12 }]}
                            multiline
                            placeholder="Reason for delay..."
                            value={delayReason}
                            onChangeText={setDelayReason}
                        />
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, justifyContent: 'flex-end' }}>
                            <Button variant="outline" onPress={() => setShowDelayModal(false)}>Cancel</Button>
                            <Button onPress={handleDelaySubmit} variant="danger" style={{ backgroundColor: '#D69E2E' }}>Report</Button>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    header: {
        flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#E2E8F0'
    },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    backText: { fontSize: 16, color: '#1A202C' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A202C' },
    headerSub: { fontSize: 12, color: '#718096' },

    actionBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EDF2F7'
    },

    tabContainer: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16 },
    tab: { paddingVertical: 12, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: '#3182CE' },
    tabText: { fontSize: 14, color: '#718096', fontWeight: '500' },
    tabTextActive: { color: '#3182CE', fontWeight: '600' },

    content: { padding: 16 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#2D3748' },
    bodyText: { fontSize: 14, color: '#4A5568', lineHeight: 20 },
    emptyText: { textAlign: 'center', color: '#A0AEC0', padding: 20 },

    commentBox: { borderLeftWidth: 3, borderLeftColor: '#3182CE', paddingLeft: 12 },
    commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    commentUser: { fontWeight: '600', fontSize: 14, color: '#2D3748' },
    commentTime: { fontSize: 12, color: '#718096' },
    commentContent: { fontSize: 14, color: '#4A5568' },

    metaSection: { marginBottom: 12 },
    metaLabel: { fontSize: 10, fontWeight: 'bold', color: '#A0AEC0', marginBottom: 8, letterSpacing: 1 },
    metaRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 },
    metaValue: { fontSize: 14, fontWeight: '600', color: '#2D3748' },
    metaSub: { fontSize: 10, fontWeight: '600', color: '#A0AEC0', textTransform: 'uppercase' },

    overdueBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF5F5', padding: 6, borderRadius: 4, borderWidth: 1, borderColor: '#FEB2B2' },
    overdueText: { color: '#C53030', fontSize: 10, fontWeight: 'bold' },

    // Modals
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#fff' },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },

    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 6 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 16 },
    textArea: { height: 100, textAlignVertical: 'top' },
});
