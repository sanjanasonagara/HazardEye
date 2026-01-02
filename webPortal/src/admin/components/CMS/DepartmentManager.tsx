import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, X, Briefcase, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { fetchApi } from '../../../shared/services/api';

interface Department {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
}

export const DepartmentManager = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingItem, setEditingItem] = useState<Department | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });

    const fetchDepartments = async () => {
        try {
            const data = await fetchApi<Department[]>('/departments/all');
            setDepartments(data);
        } catch (error) {
            console.error('Failed to load departments', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await fetchApi(`/departments/${editingItem.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ ...formData, id: editingItem.id })
                });
            } else {
                await fetchApi('/departments', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }
            setIsCreating(false);
            setEditingItem(null);
            fetchDepartments();
        } catch (error) {
            alert('Failed to save department.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this department?')) return;
        try {
            await fetchApi(`/departments/${id}`, { method: 'DELETE' });
            fetchDepartments();
        } catch (error) {
            alert('Failed to delete department.');
        }
    };

    const handleOpenCreate = () => {
        setFormData({ name: '', description: '', isActive: true });
        setEditingItem(null);
        setIsCreating(true);
    };

    const handleEdit = (item: Department) => {
        setFormData({ name: item.name, description: item.description, isActive: item.isActive });
        setEditingItem(item);
        setIsCreating(true);
    };

    const filtered = departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

    const styles = {
        overlay: {
            position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        },
        modal: {
            backgroundColor: 'white', borderRadius: '0.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '500px',
            margin: '1rem', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' as const
        },
        modalHeader: {
            padding: '1.5rem', borderBottom: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc'
        },
        modalTitle: { fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', margin: 0 },
        modalBody: { padding: '1.5rem', overflowY: 'auto' as const },
        formGroup: { marginBottom: '1.25rem' },
        label: { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.375rem' },
        input: {
            width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
            border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#1e293b', outline: 'none'
        },
        modalFooter: {
            padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'flex-end', gap: '0.75rem'
        },
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search departments..."
                        style={{ ...styles.input, paddingLeft: '2.5rem' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="primary" onClick={handleOpenCreate}>
                    <Plus size={16} style={{ marginRight: '0.5rem' }} />
                    Add Department
                </Button>
            </div>

            <div style={{
                backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0',
                overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '1rem 1.5rem' }}>Name</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Description</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                             <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : filtered.length > 0 ? (
                            filtered.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#1e293b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', color: '#3b82f6' }}>
                                                <Briefcase size={16} />
                                            </div>
                                            {item.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                                        {item.description || '—'}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.625rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                                            backgroundColor: item.isActive ? '#dcfce7' : '#fee2e2',
                                            color: item.isActive ? '#15803d' : '#991b1b',
                                            display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content', border: `1px solid ${item.isActive ? '#bbf7d0' : '#fecaca'}`
                                        }}>
                                            {item.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                            {item.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button onClick={() => handleEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} title="Edit">
                                                <Edit3 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No departments found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isCreating && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>{editingItem ? 'Edit Department' : 'Add New Department'}</h2>
                            <button onClick={() => setIsCreating(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                                <X size={20} color="#64748b" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={styles.modalBody}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Name</label>
                                    <input
                                        required
                                        type="text"
                                        style={styles.input}
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Operations"
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Description</label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description"
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                        Active
                                    </label>
                                </div>
                            </div>
                            <div style={styles.modalFooter}>
                                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button type="submit" variant="primary">{editingItem ? 'Save Changes' : 'Create Department'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
