import React, { useState } from 'react';
import {
    Plus,
    Search,
    FileText,
    Eye,
    Edit3,
    Trash2,
    Archive,
    X
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { LocationManager } from '../components/CMS/LocationManager';

const contentTypes = ['All', 'Safety Guideline', 'SOP', 'Announcement', 'Policy'];

const CMS = () => {
    // We append 'Locations' to the filter tabs
    const TABS = [...contentTypes, 'Locations'];

    const [cmsData, setCmsData] = useState<any[]>([]);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    // Modal States (Content)
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [viewingItem, setViewingItem] = useState<any>(null);

    // Form State (Content)
    const [formData, setFormData] = useState({
        id: null as number | null,
        title: '',
        type: contentTypes[1],
        status: 'Draft',
        content: '',
        author: 'Admin User',
        date: new Date().toISOString().split('T')[0]
    });

    const filteredContent = cmsData.filter(item => {
        const matchesType = filter === 'All' || item.type === filter;
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        const baseStyle = { padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-block' };
        switch (status) {
            case 'Published': return { ...baseStyle, backgroundColor: '#dcfce7', color: '#15803d' };
            case 'Draft': return { ...baseStyle, backgroundColor: '#f1f5f9', color: '#475569' };
            case 'Archived': return { ...baseStyle, backgroundColor: '#ffedd5', color: '#c2410c' };
            default: return { ...baseStyle, backgroundColor: '#f1f5f9', color: '#334155' };
        }
    };

    // --- Actions (Content) ---

    const handleOpenCreate = () => {
        setFormData({
            id: null,
            title: '',
            type: contentTypes[1],
            status: 'Draft',
            content: '',
            author: 'Admin User',
            date: new Date().toISOString().split('T')[0]
        });
        setIsEditing(false);
        setIsCreating(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            // Update existing
            setCmsData(prev => prev.map(item => item.id === formData.id ? { ...formData, id: formData.id as number } : item));
            alert('Content updated successfully.');
        } else {
            // Create new
            const newItem = {
                ...formData,
                id: Math.max(...cmsData.map(i => i.id || 0), 0) + 1,
            };
            setCmsData(prev => [newItem, ...prev]);
            alert('Content created successfully.');
        }

        setIsCreating(false);
        setIsEditing(false);
    };

    const handleEdit = (item: any) => {
        setFormData({ ...item });
        setIsEditing(true);
        setIsCreating(true);
    };

    const handleView = (item: any) => {
        setViewingItem(item);
    };

    const handleArchive = (id: number) => {
        if (window.confirm('Are you sure you want to archive this content?')) {
            setCmsData(prev => prev.map(item =>
                item.id === id ? { ...item, status: 'Archived' } : item
            ));
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
            setCmsData(prev => prev.filter(item => item.id !== id));
        }
    };

    // --- Standard CSS Styles ---
    const styles = {
        overlay: {
            position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        },
        modal: {
            backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            width: '100%', maxWidth: '36rem', margin: '1rem', overflow: 'hidden', border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.2s ease-out'
        },
        modalHeader: {
            padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc',
        },
        modalTitle: { fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', margin: 0 },
        closeButton: {
            backgroundColor: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer',
            padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.375rem'
        },
        modalBody: { padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' as const },
        formGroup: { marginBottom: '1.25rem' },
        label: { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.375rem' },
        input: {
            width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1',
            fontSize: '0.875rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box' as const, backgroundColor: '#ffffff'
        },
        textarea: {
            width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1',
            fontSize: '0.875rem', color: '#1e293b', outline: 'none', minHeight: '8rem', resize: 'vertical' as const,
            fontFamily: 'inherit', lineHeight: '1.5', boxSizing: 'border-box' as const
        },
        gridCols2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' },
        modalFooter: {
            padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'flex-end', gap: '0.75rem'
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>

            {/* Top Bar (Tabs) */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                    {TABS.map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                backgroundColor: filter === type ? '#1e293b' : 'white',
                                color: filter === type ? 'white' : '#64748b',
                                border: filter === type ? 'none' : '1px solid #e2e8f0',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                borderRadius: '0.375rem',
                                boxShadow: filter !== type ? '0 1px 2px 0 rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {filter !== 'Locations' && (
                    <Button variant="primary" onClick={handleOpenCreate}>
                        <Plus size={16} style={{ marginRight: '0.5rem' }} />
                        Create New
                    </Button>
                )}
            </div>

            {/* LOCATION MANAGER VIEW */}
            {filter === 'Locations' ? (
                <LocationManager />
            ) : (
                /* CONTENT MANAGER VIEW */
                <>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search content by title..."
                            style={{
                                width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', border: '1px solid #e2e8f0',
                                borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
                            }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Table */}
                    <div style={{
                        backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0',
                        overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, textAlign: 'left', letterSpacing: '0.05em' }}>
                                        <th style={{ padding: '1rem 1.5rem' }}>Title</th>
                                        <th style={{ padding: '1rem 1.5rem' }}>Type</th>
                                        <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                                        <th style={{ padding: '1rem 1.5rem' }}>Author</th>
                                        <th style={{ padding: '1rem 1.5rem' }}>Date</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContent.length > 0 ? filteredContent.map(item => (
                                        <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem', color: '#444' }}>
                                                        <FileText size={20} />
                                                    </div>
                                                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.title}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', color: '#475569', fontSize: '0.875rem' }}>{item.type}</td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <span style={getStatusColor(item.status)}>{item.status}</span>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>{item.author}</td>
                                            <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>{item.date}</td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <button onClick={() => handleView(item)} title="View" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}><Eye size={18} /></button>
                                                    <button onClick={() => handleEdit(item)} title="Edit" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}><Edit3 size={18} /></button>
                                                    <button onClick={() => handleArchive(item.id!)} title="Archive" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}><Archive size={18} /></button>
                                                    <button onClick={() => handleDelete(item.id!)} title="Delete" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} style={{ padding: '4rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                                                No content found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Create/Edit Modal (Content) */}
            {isCreating && filter !== 'Locations' && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>{isEditing ? 'Edit Content' : 'Create New Content'}</h2>
                            <button onClick={() => setIsCreating(false)} style={styles.closeButton}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div style={styles.modalBody}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Title</label>
                                    <input required type="text" style={styles.input} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div style={styles.gridCols2}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Type</label>
                                        <select style={styles.input} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                            {contentTypes.filter(t => t !== 'All').map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Status</label>
                                        <select style={styles.input} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                            <option value="Draft">Draft</option>
                                            <option value="Published">Published</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={styles.label}>Content / Description</label>
                                    <textarea style={styles.textarea} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}></textarea>
                                </div>
                            </div>
                            <div style={styles.modalFooter}>
                                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button type="submit" variant="primary">{isEditing ? 'Save Changes' : 'Create Content'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewingItem && filter !== 'Locations' && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Content Details</h2>
                            <button onClick={() => setViewingItem(null)} style={styles.closeButton}><X size={20} /></button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>Title</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', lineHeight: '1.5' }}>{viewingItem.title}</div>
                            </div>
                            <div style={styles.gridCols2}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>Type</div>
                                    <div style={{ fontSize: '1rem', color: '#1e293b', lineHeight: '1.5' }}>{viewingItem.type}</div>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>Status</div>
                                    <span style={getStatusColor(viewingItem.status)}>{viewingItem.status}</span>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>Author & Date</div>
                                <div style={{ fontSize: '1rem', color: '#1e293b', lineHeight: '1.5' }}>by {viewingItem.author} on {viewingItem.date}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>Description</div>
                                <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #f1f5f9', fontSize: '1rem', color: '#1e293b', lineHeight: '1.5' }}>
                                    {viewingItem.content || "No description provided."}
                                </div>
                            </div>
                        </div>
                        <div style={styles.modalFooter}>
                            <Button variant="outline" onClick={() => setViewingItem(null)}>Close</Button>
                            <Button variant="primary" onClick={() => { setViewingItem(null); handleEdit(viewingItem); }}>Edit Content</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CMS;
