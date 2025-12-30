import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { getTasks, Task, createTask } from '../../src/services/DatabaseMock';
import { Card, CardHeader, CardBody } from '../../src/components/UI/Card';
import { Badge } from '../../src/components/UI/Badge';
import { Button } from '../../src/components/UI/Button';
import { format } from 'date-fns';

type TaskStatus = 'Open' | 'In Progress' | 'Completed' | 'Delayed';
type Priority = 'High' | 'Medium' | 'Low';

const statuses: TaskStatus[] = ['Open', 'In Progress', 'Completed', 'Delayed'];
const priorities: Priority[] = ['High', 'Medium', 'Low'];

const AREA_OPTIONS = ['Sector 7', 'Storage Area B', 'Main Hall', 'Pump House', 'Control Room'];
const PLANT_OPTIONS = ['Main Refinery', 'East Wing', 'West Wing', 'North Plant'];

export default function SupervisorTasksScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isCreateModalVisible, setCreateModalVisible] = useState(false);

    // Filter Logic
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
    const [priorityFilter, setPriorityFilter] = useState<Priority[]>([]);

    // Form State
    const [newDescription, setNewDescription] = useState('');
    const [newArea, setNewArea] = useState('');
    const [newPlant, setNewPlant] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [newPriority, setNewPriority] = useState<Priority>('Medium');
    const [newAssignee, setNewAssignee] = useState('');
    const [newPrecautions, setNewPrecautions] = useState('');
    const [incidentId, setIncidentId] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadTasks();
        }, [])
    );

    useEffect(() => {
        if (params.createForIncident) {
            setIncidentId(params.createForIncident as string);
            setNewArea(params.initialArea as string || '');
            setNewPlant(params.initialPlant as string || '');
            setNewDescription(params.initialDescription as string || '');
            setCreateModalVisible(true);
            router.setParams({ createForIncident: '' });
        }
    }, [params.createForIncident]);

    const loadTasks = () => {
        setTasks(getTasks());
    };

    // Derived State for Filtering
    const filteredTasks = useMemo(() => {
        let filtered = [...tasks];

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(task => {
                const haystacks = [
                    task.description,
                    task.area,
                    task.plant,
                    task.assignee,
                    task.assignedToName
                ];
                return haystacks.some(value => value && value.toLowerCase().includes(q));
            });
        }

        // Status Filter
        if (statusFilter.length > 0) {
            filtered = filtered.filter(t => statusFilter.includes(t.status as TaskStatus));
        }

        // Priority Filter
        if (priorityFilter.length > 0) {
            filtered = filtered.filter(t => priorityFilter.includes(t.priority as Priority));
        }

        return filtered;
    }, [tasks, searchQuery, statusFilter, priorityFilter]);

    const toggleStatusFilter = (status: TaskStatus) => {
        setStatusFilter(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
    };

    const togglePriorityFilter = (priority: Priority) => {
        setPriorityFilter(prev => prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]);
    };

    const handleCreateTask = () => {
        if (!newDescription || !newAssignee || !newArea || !newPlant || !newDueDate) {
            Alert.alert("Error", "Description, Assignee, Area, Plant, and Due Date are required.");
            return;
        }

        const task: Task = {
            id: 'T-' + Math.floor(Math.random() * 10000).toString(),
            title: newDescription, // Mobile doesn't have title field in UI, reusing desc
            assignee: newAssignee,
            assignedToName: newAssignee, // Simplification for mock
            description: newDescription,
            priority: newPriority,
            status: 'Open',
            due_date: newDueDate,
            comments: '[]',
            area: newArea,
            plant: newPlant,
            precautions: newPrecautions,
            incident_id: incidentId || undefined,
            created_at: new Date().toISOString(),
            createdBy: 'current-user-id',
            createdByName: 'You'
        };

        createTask(task);
        setCreateModalVisible(false);
        resetForm();
        loadTasks();
        Alert.alert("Success", "Task created successfully.");
    };

    const resetForm = () => {
        setNewAssignee('');
        setNewDescription('');
        setNewPriority('Medium');
        setNewDueDate(format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
        setNewArea('');
        setNewPlant('');
        setNewPrecautions('');
        setIncidentId(null);
    };

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date();
    };

    const renderItem = ({ item }: { item: Task }) => {
        const overdue = isOverdue(item.due_date) && item.status !== 'Completed';

        return (
            <TouchableOpacity onPress={() => router.push(`/(supervisor)/tasks/${item.id}`)}>
                <Card style={{ marginBottom: 12 }}>
                    <CardBody>
                        <View style={styles.cardHeaderRow}>
                            <View style={styles.badgeRow}>
                                <Badge variant={item.priority}>{item.priority}</Badge>
                                <Badge variant={item.status}>{item.status}</Badge>
                                {overdue && <Badge variant="High" style={{ backgroundColor: '#FED7D7' }}><Text style={{ color: '#C53030' }}>Overdue</Text></Badge>}
                            </View>
                        </View>

                        <Text style={styles.cardTitle} numberOfLines={2}>{item.description}</Text>

                        <View style={styles.metaContainer}>
                            <View style={styles.metaItem}>
                                <Ionicons name="calendar-outline" size={14} color={overdue ? '#C53030' : '#718096'} />
                                <Text style={[styles.metaText, overdue && styles.overdueText]}>
                                    Due: {new Date(item.due_date).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Ionicons name="person-outline" size={14} color="#718096" />
                                <Text style={styles.metaText}>To: {item.assignedToName || item.assignee}</Text>
                            </View>
                        </View>

                        <View style={styles.locationRow}>
                            <Text style={styles.locationText}>{item.area} • {item.plant}</Text>
                            {item.delayReason && (
                                <View style={styles.delayBadge}>
                                    <Ionicons name="alert-circle" size={12} color="#C05621" />
                                    <Text style={styles.delayText}>Delayed</Text>
                                </View>
                            )}
                        </View>

                    </CardBody>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.headerTitle}>Task Management</Text>
                            <Text style={styles.headerSubtitle}>Assign and track safety tasks ({tasks.length})</Text>
                        </View>
                        <Button variant="ghost" onPress={() => setCreateModalVisible(true)} style={styles.createBtn}>
                            <Ionicons name="add" size={24} color="#2563EB" />
                        </Button>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#A0AEC0" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#A0AEC0"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color="#A0AEC0" />
                            </TouchableOpacity>
                        )}
                    </View>
                </SafeAreaView>
            </View>

            {/* Filter Section */}
            <View style={styles.filterSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                    <View style={styles.filterGroup}>
                        <Ionicons name="filter" size={16} color="#718096" />
                        <Text style={styles.filterLabel}>Status:</Text>
                    </View>
                    {statuses.map(s => (
                        <TouchableOpacity
                            key={s}
                            style={[styles.filterChip, statusFilter.includes(s) && styles.filterChipActive]}
                            onPress={() => toggleStatusFilter(s)}
                        >
                            <Text style={[styles.filterChipText, statusFilter.includes(s) && styles.filterChipTextActive]}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                    <View style={[styles.filterGroup, { marginLeft: 8 }]}>
                        <Ionicons name="filter" size={16} color="#718096" />
                        <Text style={styles.filterLabel}>Priority:</Text>
                    </View>
                    {priorities.map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.filterChip, priorityFilter.includes(p) && styles.filterChipActive]}
                            onPress={() => togglePriorityFilter(p)}
                        >
                            <Text style={[styles.filterChipText, priorityFilter.includes(p) && styles.filterChipTextActive]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredTasks}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={48} color="#E2E8F0" />
                        <Text style={styles.emptyText}>No tasks found</Text>
                        <Text style={styles.emptySubText}>Try adjusting your filters</Text>
                    </View>
                }
            />

            {/* Create Task Modal */}
            <Modal
                visible={isCreateModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create New Task</Text>
                            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#4A5568" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.formContent}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Task Description *</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Describe the task..."
                                    multiline
                                    numberOfLines={3}
                                    value={newDescription}
                                    onChangeText={setNewDescription}
                                />
                            </View>

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Area *</Text>
                                    <View style={styles.selectWrapper}>
                                        {/* Mock Select using views for now, ideally use a picker or modal */}
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Area"
                                            value={newArea}
                                            onChangeText={setNewArea}
                                        />
                                    </View>
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Plant *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Plant"
                                        value={newPlant}
                                        onChangeText={setNewPlant}
                                    />
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Due Date *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="YYYY-MM-DD"
                                        value={newDueDate}
                                        onChangeText={setNewDueDate}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Priority *</Text>
                                    <View style={styles.prioritySelector}>
                                        {priorities.map(p => (
                                            <TouchableOpacity
                                                key={p}
                                                style={[styles.pOption, newPriority === p && styles.pOptionActive]}
                                                onPress={() => setNewPriority(p)}
                                            >
                                                <Text style={[styles.pText, newPriority === p && styles.pTextActive]}>{p}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Assignee *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Select employee..."
                                    value={newAssignee}
                                    onChangeText={setNewAssignee}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Precautions / Advisory (Optional)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="AI-generated recommendations..."
                                    multiline
                                    numberOfLines={3}
                                    value={newPrecautions}
                                    onChangeText={setNewPrecautions}
                                />
                            </View>

                            <View style={styles.modalFooter}>
                                <Button variant="outline" onPress={() => setCreateModalVisible(false)} style={{ width: 100 }}>Cancel</Button>
                                <Button onPress={handleCreateTask} style={{ flex: 1 }}>Create Task</Button>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a202c',
    },
    headerSubtitle: {
        color: '#718096',
        fontSize: 14,
        marginTop: 4,
    },
    createBtn: {
        backgroundColor: '#EBF8FF', // Light blue bg for ghost/icon btn
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#2D3748',
    },
    filterSection: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    filterGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginRight: 4,
    },
    filterLabel: {
        fontWeight: '600',
        color: '#4A5568',
        fontSize: 14,
    },
    filterChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#EDF2F7',
    },
    filterChipActive: {
        backgroundColor: '#2563EB',
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#4A5568',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: 16,
    },
    // Card Styles
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 12,
        lineHeight: 22,
    },
    metaContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        color: '#718096',
    },
    overdueText: {
        color: '#C53030',
        fontWeight: '500',
    },
    locationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F7FAFC',
        paddingTop: 12,
    },
    locationText: {
        fontSize: 13,
        color: '#A0AEC0',
    },
    delayBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFFAF0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#FBD38D',
    },
    delayText: {
        fontSize: 11,
        color: '#C05621',
        fontWeight: '600',
    },
    // Empty State
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#A0AEC0',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#CBD5E0',
        marginTop: 4,
    },
    // Modal
    modalContainer: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#fff',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    formContent: {
        padding: 20,
        paddingBottom: 40,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#2D3748',
    },
    selectWrapper: {
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    prioritySelector: {
        flexDirection: 'row',
        gap: 8,
    },
    pOption: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CBD5E0',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    pOptionActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    pText: {
        color: '#4A5568',
        fontSize: 13,
        fontWeight: '600',
    },
    pTextActive: {
        color: '#fff',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
});
