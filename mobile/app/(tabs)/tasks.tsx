import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { getTasks, Task, updateTaskStatus, addTaskComment, reportTaskDelay } from '../../src/services/Database';

export default function TasksScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);

    // Modal State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'comment' | 'delay'>('comment');
    const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');


    useFocusEffect(
        useCallback(() => {
            loadTasks();
        }, [])
    );

    const loadTasks = () => {
        const data = getTasks();
        setTasks(data);
    };

    const handleComplete = (id: string) => {
        updateTaskStatus(id, 'completed');
        loadTasks();
    };

    const handleReOpen = (id: string) => {
        updateTaskStatus(id, 'pending');
        loadTasks();
    };

    const openModal = (id: string, type: 'comment' | 'delay') => {
        setCurrentTaskId(id);
        setModalType(type);
        setInputText('');
        setIsModalVisible(true);
    };

    const saveInput = () => {
        if (!inputText.trim() || !currentTaskId) {
            setIsModalVisible(false);
            return;
        }

        if (modalType === 'comment') {
            addTaskComment(currentTaskId, inputText);
            Alert.alert("Success", "Comment added.");
        } else {
            reportTaskDelay(currentTaskId, inputText);
            Alert.alert("Reported", "Delay reason logged.");
        }

        setIsModalVisible(false);
        setInputText('');
        loadTasks();
    };

    const stats = useMemo(() => {
        return {
            high: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
            inProgress: tasks.filter(t => t.status === 'in_progress').length,
            completed: tasks.filter(t => t.status === 'completed').length
        };
    }, [tasks]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return { bg: '#FED7D7', text: '#C53030' };
            case 'medium': return { bg: '#FEEBC8', text: '#C05621' };
            case 'low': return { bg: '#C6F6D5', text: '#2F855A' };
            default: return { bg: '#EDF2F7', text: '#4A5568' };
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending': return { bg: '#FFFAF0', text: '#DD6B20', label: 'PENDING' };
            case 'in_progress': return { bg: '#EBF8FF', text: '#3182CE', label: 'IN PROGRESS' };
            case 'completed': return { bg: '#C6F6D5', text: '#2F855A', label: 'COMPLETED' };
            default: return { bg: '#EDF2F7', text: '#4A5568', label: 'UNK' };
        }
    };

    const renderItem = ({ item }: { item: Task }) => {
        const priorityStyle = getPriorityColor(item.priority);
        const statusStyle = getStatusStyle(item.status);
        const comments = item.comments ? JSON.parse(item.comments) : [];

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.badges}>
                        <View style={[styles.badge, { backgroundColor: priorityStyle.bg }]}>
                            <Text style={[styles.badgeText, { color: priorityStyle.text }]}>{item.priority.toUpperCase()}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.badgeText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1 }} />
                    <Text style={styles.taskIdText}>#{item.id}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>

                <View style={styles.metaRow}>
                    <Ionicons name="person-outline" size={14} color="#718096" />
                    <Text style={styles.metaText}>{item.assignee}</Text>
                </View>

                <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={14} color="#718096" />
                    <Text style={styles.metaText}>Due: {item.due_date}</Text>
                </View>

                {item.delay_reason ? (
                    <View style={styles.delayBox}>
                        <Ionicons name="warning-outline" size={16} color="#C53030" />
                        <Text style={styles.delayText}>Delayed: {item.delay_reason}</Text>
                    </View>
                ) : null}

                <Text style={styles.description}>{item.description}</Text>

                {comments.length > 0 && (
                    <View style={styles.commentsSection}>
                        <Text style={styles.commentHeader}>Recent Comments ({comments.length}):</Text>
                        {comments.slice(-2).map((c: string, idx: number) => (
                            <View key={idx} style={styles.commentRow}>
                                <Ionicons name="chatbubble-ellipses-outline" size={12} color="#718096" />
                                <Text style={styles.commentText} numberOfLines={2}>{c}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.commentBtn} onPress={() => openModal(item.id, 'comment')}>
                        <Text style={styles.commentBtnText}>ADD COMMENT</Text>
                    </TouchableOpacity>

                    {new Date(item.due_date) < new Date() && item.status !== 'completed' && (
                        <TouchableOpacity style={styles.delayBtn} onPress={() => openModal(item.id, 'delay')}>
                            <Text style={styles.delayBtnText}>DELAY</Text>
                        </TouchableOpacity>
                    )}

                    <View style={{ flex: 0.1 }} />

                    {item.status === 'completed' ? (
                        <TouchableOpacity style={styles.reopenBtn} onPress={() => handleReOpen(item.id)}>
                            <Text style={styles.actionBtnText}>RE-OPEN</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.completeBtn} onPress={() => handleComplete(item.id)}>
                            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                            <Text style={styles.actionBtnText}>DONE</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.mainContainer}>
            <View style={styles.header}>
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <Text style={styles.headerTitle}>Assigned Tasks</Text>
                    <Text style={styles.headerSubtitle}>{tasks.filter(t => t.status !== 'completed').length} tasks pending</Text>
                </SafeAreaView>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={[styles.statNumber, { color: '#E53E3E' }]}>{stats.high}</Text>
                    <Text style={styles.statLabel}>High Priority</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statNumber, { color: '#D69E2E' }]}>{stats.inProgress}</Text>
                    <Text style={styles.statLabel}>In Progress</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statNumber, { color: '#38A169' }]}>{stats.completed}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>
            </View>

            <FlatList
                data={tasks}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />

            <Modal
                transparent={true}
                visible={isModalVisible}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{modalType === 'comment' ? 'Add Comment' : 'Report Task Delay'}</Text>
                        <TextInput
                            style={styles.commentInput}
                            placeholder={modalType === 'comment' ? "Enter your comment..." : "Reason for delay..."}
                            multiline
                            numberOfLines={4}
                            value={inputText}
                            onChangeText={setInputText}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={saveInput}>
                                <Text style={styles.saveBtnText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        marginTop: -20, // Overlap header
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#718096',
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    badges: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    taskIdText: {
        fontSize: 12,
        color: '#718096',
        marginRight: 8,
        fontFamily: 'SpaceMono-Regular',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 8,
    },
    metaText: {
        fontSize: 14,
        color: '#718096',
    },
    description: {
        fontSize: 14,
        color: '#4A5568',
        marginTop: 8,
        lineHeight: 20,
        marginBottom: 16,
    },
    delayBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        padding: 8,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#FEB2B2',
        gap: 8,
    },
    delayText: {
        color: '#C53030',
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    commentBtn: {
        flex: 1,
        backgroundColor: '#F7FAFC',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    commentBtnText: {
        color: '#4A5568',
        fontWeight: 'bold',
        fontSize: 11,
    },
    delayBtn: {
        backgroundColor: '#FEEBC8',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    delayBtnText: {
        color: '#C05621',
        fontWeight: 'bold',
        fontSize: 11,
    },
    completeBtn: {
        flex: 1.2,
        backgroundColor: '#48BB78', // Green
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    reopenBtn: {
        flex: 1.2,
        backgroundColor: '#2563EB', // Blue
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 11,
    },
    commentsSection: {
        marginTop: 8,
        marginBottom: 16,
        padding: 8,
        backgroundColor: '#F7FAFC',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#CBD5E0',
    },
    commentHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#718096',
        marginBottom: 4,
    },
    commentRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 4,
    },
    commentText: {
        fontSize: 12,
        color: '#4A5568',
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 12,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        padding: 12,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 16,
        fontSize: 14,
        color: '#2D3748',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    cancelBtnText: {
        color: '#718096',
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: '#2563EB',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
